import { randomBytes } from 'crypto';
import { Result } from '../../shared/result';
import { BankConnection } from '../../domain/bank-connection/BankConnection.entity';
import type { IBankConnectionRepository } from '../../domain/bank-connection/IBankConnectionRepository';
import type { ILogger } from '../../shared/logging';
import type { TinkOAuthService } from '../../infrastructure/services/TinkOAuthService';

export class InitiateBankOAuthUseCase {
  constructor(
    private repository: IBankConnectionRepository,
    private tinkService: TinkOAuthService,
    private logger: ILogger,
  ) {}

  async execute(customerId: string): Promise<Result<{ authUrl: string; state: string }, Error>> {
    try {
      const state = randomBytes(32).toString('hex');
      const connection = BankConnection.create(customerId, state);

      const saveResult = await this.repository.save(connection);
      if (saveResult.isFail) {
        this.logger.error('Failed to save bank connection', { customerId, error: saveResult.getError() });
        return Result.fail(saveResult.getError() || new Error('Unknown error'));
      }

      const authUrl = this.tinkService.generateAuthorizationUrl(state, customerId);
      this.logger.info('OAuth flow initiated', { customerId, connectionId: connection.id });

      return Result.ok({ authUrl, state });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('OAuth initiation failed', { customerId, error: message });
      return Result.fail(new Error(`OAuth initiation failed: ${message}`));
    }
  }
}
