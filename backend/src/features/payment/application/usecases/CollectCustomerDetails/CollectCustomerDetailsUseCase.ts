import type { GoCardlessClient } from 'gocardless-nodejs';
import { Result } from '@/features/shared/result';
import type { ILogger } from '@/features/shared/logging';
import type { CollectCustomerDetailsInput } from './CollectCustomerDetails.dto';

/**
 * CollectCustomerDetailsUseCase
 *
 * GoCardless API call #2 of the Direct Debit setup flow.
 * Updates the billing request with the customer's identity and billing address.
 *
 * Endpoint: POST /billing_requests/{id}/actions/collect_customer_details
 */
export class CollectCustomerDetailsUseCase {
  constructor(
    private gocardless: GoCardlessClient,
    private logger: ILogger
  ) {}

  async execute(input: CollectCustomerDetailsInput): Promise<Result<void, Error>> {
    try {
      await this.gocardless.billingRequests.collectCustomerDetails(input.billingRequestId, {
        customer: {
          email: input.email,
          given_name: input.givenName,
          family_name: input.familyName,
        },
        customer_billing_detail: {
          address_line1: input.addressLine1,
          city: input.city,
          postal_code: input.postalCode,
          country_code: input.countryCode,
        },
      } as any);

      this.logger.info('Collected customer details on billing request', {
        billingRequestId: input.billingRequestId,
      });

      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown GC error';
      this.logger.error('CollectCustomerDetails failed', {
        billingRequestId: input.billingRequestId,
        error: message,
      });
      return Result.fail(new Error(`Failed to collect customer details: ${message}`));
    }
  }
}
