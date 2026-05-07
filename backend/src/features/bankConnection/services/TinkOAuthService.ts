import type { ILogger } from '../../shared/logging';
import type { AppConfig } from '../../shared/config';
import { Result } from '../../shared/result';
import { MOCK_TINK_RESPONSE } from './data/income_report';

interface TinkTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export class TinkOAuthService {
  private cachedToken: { token: string; expiresAt: number } | null = null;
  private readonly tinkBaseUrl: string;

  constructor(
    private config: AppConfig,
    private logger: ILogger
  ) {
    this.tinkBaseUrl = config.tink.environment === 'sandbox'
      ? 'https://api.tink.com/api/v1'
      : 'https://api.tink.com/api/v1';
  }

  async getAccessToken(): Promise<Result<string, Error>> {
    try {
      if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
        return Result.ok(this.cachedToken.token);
      }

      const response = await fetch(`${this.tinkBaseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.tink.clientId,
          client_secret: this.config.tink.clientSecret,
          grant_type: 'client_credentials',
          scope:
            'expense-checks:readonly',
        }).toString(),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error('Tink auth failed', { status: response.status, error });
        return Result.fail(new Error(`Tink auth failed: ${error}`));
      }

      const data = (await response.json()) as TinkTokenResponse;

      this.cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000,
      };

      return Result.ok(data.access_token);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new Error(`Failed to get Tink token: ${message}`));
    }
  }

  private async getTokenForRequest(): Promise<string | null> {
    const tokenResult = await this.getAccessToken();
    return tokenResult.isOk ? tokenResult.getOrThrow() : null;
  }

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
        this.logger.error('Failed to exchange code for access token', { status: response.status, error });
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
    return Result.ok(await MOCK_TINK_RESPONSE);
  }

  async getExpenseReport(reportId: string): Promise<Result<any, Error>> {
    return this.getReport('expense-reports', reportId);
  }

  async getRiskInsights(reportId: string): Promise<Result<any, Error>> {
    return this.getReport('risk-insights', reportId);
  }

  private async getReport(type: string, reportId: string): Promise<Result<any, Error>> {
    try {
      const token = await this.getTokenForRequest();
      if (!token) {
        return Result.fail(new Error('Failed to get Tink access token'));
      }

      const response = await fetch(
        `${this.config.tink.apiBaseUrl}/${type}/${reportId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return Result.fail(new Error(`Failed to fetch ${type}: ${response.statusText}`));
      }

      return Result.ok(await response.json());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new Error(`Failed to fetch ${type}: ${message}`));
    }
  }

  private async getCheckReport(type: string, customerId: string, accessToken: string): Promise<Result<any, Error>> {
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
