import { randomBytes } from 'crypto';
import { Result } from '../../../../shared/result';
import type { ILogger } from '../../../../shared/logging';
import type { TinkApiClient } from '@/features/bankConnection/infrastructure/services/Tink/TinkApiClient';
import type { ICustomerRepository } from '../../../../customer/types/customer.types';
import { IBankConnectionRepository } from '@/features/bankConnection/application/respositories/IBankConnectionRepository';
import { BankConnection } from '@/features/bankConnection/domain/entites/bankConnection';
import type {
  InitiateBankConnectionInput,
  InitiateBankConnectionOutput,
} from './InitiateBankConnection.dto';

export class InitiateBankConnectionUseCase {
  constructor(
    private repository: IBankConnectionRepository,
    private customerRepository: ICustomerRepository,
    private tinkService: TinkApiClient,
    private logger: ILogger
  ) {}

  async execute(
    request: InitiateBankConnectionInput
  ): Promise<Result<InitiateBankConnectionOutput, Error>> {
    try {
      // Load the existing customer — they must be linked before reaching bank connection
      const customerResult = await this.customerRepository.findById(request.customerId);
      if (customerResult.isFail) {
        this.logger.error('Failed to fetch customer', {
          customerId: request.customerId,
          error: customerResult.getError(),
        });
        return Result.fail(customerResult.getError() || new Error('Unknown error'));
      }

      const customer = customerResult.getOrThrow();
      if (!customer) {
        this.logger.error('Customer not found', { customerId: request.customerId });
        return Result.fail(new Error('Customer not found'));
      }

      const state = randomBytes(32).toString('hex');
      const connection = BankConnection.create(customer.id, state);

      const saveResult = await this.repository.save(connection);
      if (saveResult.isFail) {
        this.logger.error('Failed to save bank connection', {
          customerId: customer.id,
          error: saveResult.getError(),
        });
        return Result.fail(saveResult.getError() || new Error('Unknown error'));
      }

      const authUrl = this.tinkService.generateAuthorizationUrl(state, customer.id);
      this.logger.info('OAuth flow initiated', {
        customerId: customer.id,
        email: customer.email,
        connectionId: connection.id,
      });

      return Result.ok({ authUrl, state });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('OAuth initiation failed', {
        customerId: request.customerId,
        error: message,
      });
      return Result.fail(new Error(`OAuth initiation failed: ${message}`));
    }
  }
}
