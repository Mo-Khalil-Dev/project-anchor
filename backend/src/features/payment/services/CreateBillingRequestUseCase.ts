import type { GoCardlessClient } from 'gocardless-nodejs';
import { Result } from '../../shared/result';
import type { ILogger } from '../../shared/logging';

export interface CreateBillingRequestInput {
  /** Free-form metadata for tracing in GC dashboard */
  metadataReference: string;
}

export interface CreateBillingRequestOutput {
  billingRequestId: string;
}

/**
 * CreateBillingRequestUseCase
 *
 * GoCardless API call #1 of the Direct Debit setup flow.
 * Creates a billing request with a BACS mandate request in GBP.
 *
 * Endpoint: POST https://api.gocardless.com/billing_requests
 *
 * The returned billingRequestId is then used in subsequent calls to
 * collect customer details, bank account, and create the redirect flow.
 */
export class CreateBillingRequestUseCase {
  constructor(
    private gocardless: GoCardlessClient,
    private logger: ILogger,
  ) {}

  async execute(input: CreateBillingRequestInput): Promise<Result<CreateBillingRequestOutput, Error>> {
    try {
      const billingRequest = await this.gocardless.billingRequests.create({
        mandate_request: {
          currency: 'GBP',
          scheme: 'bacs',
          verify: 'recommended',
        },
        metadata: {
          reference: input.metadataReference,
        },
      } as any);

      const id = billingRequest.id;
      if (!id) {
        return Result.fail(new Error('GoCardless did not return a billing request ID'));
      }

      this.logger.info('Created GoCardless billing request', {
        billingRequestId: id,
        reference: input.metadataReference,
      });

      return Result.ok({ billingRequestId: id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown GC error';
      this.logger.error('CreateBillingRequest failed', { error: message });
      return Result.fail(new Error(`Failed to create billing request: ${message}`));
    }
  }
}
