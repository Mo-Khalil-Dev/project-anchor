import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import type { ICustomerRepository } from '../../../customer/types/customer.types';
import type { AccountSetupData } from '../../../shared/types/referenceData.types';

export class GetAccountSetupQuery {
  constructor(
    private customerRepository: ICustomerRepository,
    private logger: ILogger,
  ) {}

  async execute(input: { customerId: string }): Promise<Result<AccountSetupData | null, Error>> {
    try {
      const { customerId } = input;

      const customerResult = await this.customerRepository.findById(customerId);

      if (customerResult.isFail) {
        this.logger.error('Failed to fetch customer for account setup', {
          customerId,
          error: customerResult.getError(),
        });
        return Result.fail(new Error('Failed to fetch account setup data'));
      }

      const customer = customerResult.getOrElse(null);

      if (!customer) {
        return Result.ok(null);
      }

      // Check if customer has utility account details
      if (!customer.utilityAccountNo) {
        this.logger.warn('Customer linked but utility account details missing - data corruption', {
          customerId,
        });
        return Result.fail(new Error('Account data is incomplete. Please contact support.'));
      }

      const accountSetupData: AccountSetupData = {
        status: 'COMPLETED',
        customerId: customer.id,
        utility: (customer.utilityType as 'ELECTRICITY' | 'GAS' | 'WATER') || 'ELECTRICITY',
        postcode: customer.postcode || '',
        lastCompletedAt: customer.createdAt ? customer.createdAt.toISOString() : null,
      };

      return Result.ok(accountSetupData);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('GetAccountSetup query failed', {
        error: message,
      });
      return Result.fail(new Error(`Failed to get account setup: ${message}`));
    }
  }
}
