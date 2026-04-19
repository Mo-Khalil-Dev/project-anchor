import { Result } from '../../shared/result';
import type { IBankConnectionRepository } from '../../domain/bank-connection/IBankConnectionRepository';
import type { ILogger } from '../../shared/logging';
import type { TinkOAuthService } from '../../infrastructure/services/TinkOAuthService';

export class HandleBankOAuthCallbackUseCase {
  constructor(
    private repository: IBankConnectionRepository,
    private tinkService: TinkOAuthService,
    private logger: ILogger,
  ) {}

  async execute(_code: string, state: string): Promise<Result<{ connectionId: string; expenseData: any }, Error>> {
    try {
      const connResult = await this.repository.findByOAuthState(state);
      if (connResult.isFail) {
        return Result.fail(connResult.getError() || new Error('Unknown error'));
      }

      const connection = connResult.getOrThrow();
      if (!connection) {
        return Result.fail(new Error('Invalid OAuth state token'));
      }

      // Get access token for API requests
      const tokenResult = await this.tinkService.exchangeCodeForAccessToken();
      if (tokenResult.isFail) {
        return Result.fail(tokenResult.getError() || new Error('Unknown error'));
      }

      const accessToken = tokenResult.getOrThrow();

      // Fetch expense check data immediately
      const expenseResult = await this.tinkService.getExpenseCheck(connection.customerId, accessToken);
      if (expenseResult.isFail) {
        return Result.fail(expenseResult.getError() || new Error('Unknown error'));
      }

      const expenseData = expenseResult.getOrThrow();

      // Mark connection as data retrieved
      connection.markDataRetrieved();

      const updateResult = await this.repository.update(connection);
      if (updateResult.isFail) {
        return Result.fail(updateResult.getError() || new Error('Unknown error'));
      }

      this.logger.info('OAuth callback handled and data retrieved', {
        connectionId: connection.id,
        customerId: connection.customerId,
      });

      return Result.ok({ connectionId: connection.id, expenseData });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('OAuth callback failed', { error: message });
      return Result.fail(new Error(`OAuth callback failed: ${message}`));
    }
  }
}
