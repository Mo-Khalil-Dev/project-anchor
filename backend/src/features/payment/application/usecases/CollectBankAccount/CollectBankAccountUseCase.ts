import type { GoCardlessClient } from 'gocardless-nodejs';
import { Result } from '@/features/shared/result';
import type { ILogger } from '@/features/shared/logging';
import type { CollectBankAccountInput } from './CollectBankAccount.dto';

/** GoCardless sandbox test bank details */
const SANDBOX_DEFAULTS = {
  branchCode: '200000',
  accountNumber: '55779911',
  countryCode: 'GB',
};

/**
 * CollectBankAccountUseCase
 *
 * GoCardless API call #3 of the Direct Debit setup flow.
 * Updates the billing request with the customer's bank account details.
 *
 * Endpoint: POST /billing_requests/{id}/actions/collect_bank_account
 *
 * For Phase 1, real bank details are NOT collected — we hardcode the GC
 * sandbox test account so the flow is exercised without exposing user PII.
 */
export class CollectBankAccountUseCase {
  constructor(
    private gocardless: GoCardlessClient,
    private logger: ILogger
  ) {}

  async execute(input: CollectBankAccountInput): Promise<Result<void, Error>> {
    try {
      const branchCode = input.branchCode ?? SANDBOX_DEFAULTS.branchCode;
      const accountNumber = input.accountNumber ?? SANDBOX_DEFAULTS.accountNumber;
      const countryCode = input.countryCode ?? SANDBOX_DEFAULTS.countryCode;

      await this.gocardless.billingRequests.collectBankAccount(input.billingRequestId, {
        account_number: accountNumber,
        branch_code: branchCode,
        account_holder_name: input.accountHolderName,
        country_code: countryCode,
      } as any);

      this.logger.info('Collected bank account on billing request', {
        billingRequestId: input.billingRequestId,
        usingSandboxDefaults: !input.accountNumber,
      });

      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown GC error';
      this.logger.error('CollectBankAccount failed', {
        billingRequestId: input.billingRequestId,
        error: message,
      });
      return Result.fail(new Error(`Failed to collect bank account: ${message}`));
    }
  }
}
