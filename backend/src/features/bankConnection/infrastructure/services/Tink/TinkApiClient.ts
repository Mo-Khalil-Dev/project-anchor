import type { ILogger } from '@/features/shared/logging';
import type { AppConfig } from '@/features/shared/config';
import { Result } from '@/features/shared/result';
import { MOCK_TINK_INCOME_REPORT } from '@/features/bankConnection/infrastructure/services/Tink/data/income_report';

interface TinkTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export class TinkApiClient {
  constructor(
    private config: AppConfig,
    private logger: ILogger
  ) {}

  generateAuthorizationUrl(state: string, _customerId: string): string {
    const params = new URLSearchParams({
      client_id: this.config.tink.clientId,
      redirect_uri: this.config.server.redirectUrl,
      market: 'GB',
      report_types: 'EXPENSE_CHECK_REPORT',
      async: 'true',
      state,
    });

    return `https://link.tink.com/1.0/expense-check/create-report?${params.toString()}`;
  }

  async exchangeCodeForAccessToken(): Promise<Result<string, Error>> {
    try {
      const response = await fetch(`${this.config.tink.apiBaseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.tink.clientId,
          client_secret: this.config.tink.clientSecret,
          grant_type: 'client_credentials',
          scope: 'expense-checks:readonly',
          redirect_uri: this.config.server.redirectUrl,
        }).toString(),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error('Failed to exchange code for access token', {
          status: response.status,
          error,
        });
        return Result.fail(new Error(`Failed to exchange code: ${error}`));
      }

      const data = (await response.json()) as TinkTokenResponse;
      return Result.ok(data.access_token);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new Error(`Code exchange failed: ${message}`));
    }
  }

  async getExpenseCheck(code: string, accessToken: string): Promise<Result<any, Error>> {
    return this.getCheckReport('expense-checks', code, accessToken);
  }

  async getIncomeReport(_: string): Promise<Result<any, Error>> {
    return Result.ok(await MOCK_TINK_INCOME_REPORT);
  }

  private async getCheckReport(
    type: string,
    customerId: string,
    accessToken: string
  ): Promise<Result<any, Error>> {
    try {
      const response = await fetch(`${this.config.tink.expensesApiBaseUrl}/${type}/${customerId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return Result.fail(new Error(`Failed to fetch ${type}: ${response.statusText}`));
      }

      return Result.ok(await response.json());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new Error(`Failed to fetch ${type}: ${message}`));
    }
  }
}
