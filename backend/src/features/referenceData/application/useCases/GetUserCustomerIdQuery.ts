import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import type { IUserRepository } from '@/features/customer/application/repository/IUserRepository';

export class GetUserCustomerIdQuery {
  constructor(
    private userRepository: IUserRepository,
    private logger: ILogger
  ) {}

  async execute(input: {
    userId: string;
  }): Promise<Result<string | null, Error>> {
    try {
      const { userId } = input;

      this.logger.info('Resolving user to customer', { userId });

      const result = await this.userRepository.findCustomerIdByUserId(userId);

      if (result.isFail) {
        const error = result.getError() || new Error('Unknown error');
        this.logger.warn('Failed to resolve user to customer', { userId, error: error.message });
        return result;
      }

      const customerId = result.getOrElse(null);

      if (!customerId) {
        this.logger.info('User not linked to customer', { userId });
      } else {
        this.logger.info('Resolved user to customer', { userId, customerId });
      }

      return Result.ok(customerId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('GetUserCustomerId query failed', { error: message });
      return Result.fail(new Error(`Failed to get user customer ID: ${message}`));
    }
  }
}
