import { randomBytes } from 'crypto';
import { Result } from '../../shared/result';
import { BankConnection } from '../../domain/bank-connection/BankConnection.entity';
import type { IBankConnectionRepository } from '../../domain/bank-connection/IBankConnectionRepository';
import type { ILogger } from '../../shared/logging';
import type { TinkOAuthService } from '../../infrastructure/services/TinkOAuthService';
import type { PrismaCustomerRepository } from '../../infrastructure/persistence/PrismaCustomerRepository';

export class InitiateBankOAuthUseCase {
  constructor(
    private repository: IBankConnectionRepository,
    private customerRepository: PrismaCustomerRepository,
    private tinkService: TinkOAuthService,
    private logger: ILogger,
  ) {}

  async execute(customerId: string): Promise<Result<{ authUrl: string; state: string }, Error>> {
    try {
      // Load the existing customer — they must be linked before reaching bank connection
      const customerResult = await this.customerRepository.findById(customerId);
      if (customerResult.isFail) {
        this.logger.error('Failed to fetch customer', { customerId, error: customerResult.getError() });
        return Result.fail(customerResult.getError() || new Error('Unknown error'));
      }

      const customer = customerResult.getOrThrow();
      if (!customer) {
        this.logger.error('Customer not found', { customerId });
        return Result.fail(new Error('Customer not found'));
      }

      const state = randomBytes(32).toString('hex');
      const connection = BankConnection.create(customer.id, state);

      const saveResult = await this.repository.save(connection);
      if (saveResult.isFail) {
        this.logger.error('Failed to save bank connection', { customerId: customer.id, error: saveResult.getError() });
        return Result.fail(saveResult.getError() || new Error('Unknown error'));
      }

      const authUrl = this.tinkService.generateAuthorizationUrl(state, customer.id);
      this.logger.info('OAuth flow initiated', { customerId: customer.id, email: customer.email, connectionId: connection.id });

      return Result.ok({ authUrl, state });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('OAuth initiation failed', { customerId, error: message });
      return Result.fail(new Error(`OAuth initiation failed: ${message}`));
    }
  }
}
