import { Result } from '../../../../shared/result';
import type { ILogger } from '../../../../shared/logging';
import type {
  LinkUserToCustomerInput,
  LinkUserToCustomerOutput,
} from '../../../types/customer.types';
import { LinkUserToCustomerSchema } from '../../../types/customer.types';
import { ICustomerRepository } from '@/features/customer/application/repository/ICustomerRepository';

/**
 * LinkUserToCustomerUseCase
 *
 * Links an authenticated user to a customer by:
 * 1. Validating input (utility type, postcode, account reference)
 * 2. Checking the user is not already linked to a customer
 * 3. Finding the customer by utility account number (must exist in system)
 * 4. Linking the customer to the user
 * 5. Returning the customer details
 */

export class LinkUserToCustomerUseCase {
  constructor(
    private customerRepository: ICustomerRepository,
    private logger: ILogger
  ) { }

  async execute(
    userId: string,
    input: LinkUserToCustomerInput
  ): Promise<Result<LinkUserToCustomerOutput, Error>> {
    try {
      // Validate input
      const validationResult = LinkUserToCustomerSchema.safeParse(input);
      if (!validationResult.success) {
        const message = validationResult.error.errors[0]?.message || 'Invalid input';
        this.logger.warn('Validation failed for LinkUserToCustomer', { userId, error: message });
        return Result.fail(new Error(message));
      }

      const { utilityType, accountReference } = validationResult.data;

      // Step 2: Check user is not already linked to a customer
      const alreadyLinkedResult = await this.customerRepository.isUserAlreadyLinked(userId);
      if (alreadyLinkedResult.isFail) {
        this.logger.error('Failed to check user link status', { userId });
        return Result.fail(new Error('Unable to process account setup. Please try again.'));
      }
      if (alreadyLinkedResult.getOrElse(false)) {
        this.logger.warn('User attempted to re-link an already linked account', { userId });
        return Result.fail(new Error('Your account is already linked to a customer.'));
      }

      // Step 3: Find existing customer by utility account number (must exist in system)
      // TODO: Cross-validate utilityType against the found customer record.
      // Currently a user submitting accountRef "ACC-001" with utilityType "Gas" will
      // successfully link even if the customer record says "Electricity".
      // Add: if (customer.utilityType !== utilityType) return Result.fail(new Error('Account details do not match our records'))
      const existingCustomerResult =
        await this.customerRepository.findByUtilityAccountNumber(accountReference);

      if (existingCustomerResult.isFail) {
        this.logger.error('Failed to search for existing customer', {
          userId,
          accountReference,
          error: existingCustomerResult.getError(),
        });
        return Result.fail(new Error('Unable to process account setup. Please try again.'));
      }

      // Step 3 (cont): Customer MUST exist in the system — no auto-creation
      const existingCustomer = existingCustomerResult.getOrElse(null);

      if (!existingCustomer) {
        this.logger.warn('Customer not found by account reference', { userId, accountReference });
        return Result.fail(new Error('Customer cannot be found, please try again'));
      }

      // TODO: Remove redundant alias — use existingCustomer directly below
      const customer = existingCustomer;

      // Step 4: Link customer to user
      const linkResult = await this.customerRepository.linkToUser(customer.id, userId);

      if (linkResult.isFail) {
        this.logger.error('Failed to link customer to user', {
          userId,
          customerId: customer.id,
          error: linkResult.getError(),
        });
        return Result.fail(new Error('Unable to complete account setup. Please try again.'));
      }

      this.logger.info('User linked to customer successfully', {
        userId,
        customerId: customer.id,
        accountReference,
        utilityType,
      });

      // Step 5: Return customer details
      return Result.ok({
        id: customer.id,
        email: customer.email,
        utilityType: customer.utilityType ?? null,
        postcode: customer.postcode ?? null,
        utilityAccountNo: customer.utilityAccountNo ?? null,
        createdAt: customer.createdAt,
      } as LinkUserToCustomerOutput);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('LinkUserToCustomer use case failed', {
        userId,
        error: message,
      });
      return Result.fail(new Error(`Account setup failed: ${message}`));
    }
  }
}
