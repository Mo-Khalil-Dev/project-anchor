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

  async execute(code: string, state: string): Promise<Result<{ connectionId: string }, Error>> {
    try {
      const connResult = await this.repository.findByOAuthState(state);
      if (connResult.isFail) {
        return Result.fail(connResult.getError() || new Error('Unknown error'));
      }

      const connection = connResult.getOrThrow();
      if (!connection) {
        return Result.fail(new Error('Invalid OAuth state token'));
      }

      const jobResult = await this.tinkService.exchangeCodeForReportJob(code);
      if (jobResult.isFail) {
        return Result.fail(jobResult.getError() || new Error('Unknown error'));
      }

      const jobId = jobResult.getOrThrow();
      connection.markAuthorized(jobId);

      const updateResult = await this.repository.update(connection);
      if (updateResult.isFail) {
        return Result.fail(updateResult.getError() || new Error('Unknown error'));
      }

      this.logger.info('OAuth callback handled', {
        connectionId: connection.id,
        customerId: connection.customerId,
        jobId,
      });

      return Result.ok({ connectionId: connection.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('OAuth callback failed', { error: message });
      return Result.fail(new Error(`OAuth callback failed: ${message}`));
    }
  }
}
