import type { GoCardlessClient } from 'gocardless-nodejs';
import { Result } from '@/features/shared/result';
import type { ILogger } from '@/features/shared/logging';
import type {
  CreateBillingRequestFlowInput,
  CreateBillingRequestFlowOutput,
} from './CreateBillingRequestFlow.dto';

/**
 * CreateBillingRequestFlowUseCase
 *
 * GoCardless API call #4 (final) of the Direct Debit setup flow.
 * Creates a billing request flow which provides the hosted authorization URL.
 *
 * Endpoint: POST /billing_request_flows
 *
 * The frontend redirects the customer to authorizationUrl. After they finish
 * (or exit), GC redirects them back to redirectUri / exitUri respectively
 * AND fires a `mandate_created` webhook (which we'll handle in Phase 2).
 */
export class CreateBillingRequestFlowUseCase {
  constructor(
    private gocardless: GoCardlessClient,
    private logger: ILogger
  ) {}

  async execute(
    input: CreateBillingRequestFlowInput
  ): Promise<Result<CreateBillingRequestFlowOutput, Error>> {
    try {
      const flow = await this.gocardless.billingRequestFlows.create({
        redirect_uri: input.redirectUri,
        exit_uri: input.exitUri,
        links: {
          billing_request: input.billingRequestId,
        },
      } as any);

      const url = (flow as any).authorisation_url ?? (flow as any).authorization_url;
      if (!url || !flow.id) {
        return Result.fail(new Error('GoCardless did not return a flow URL'));
      }

      this.logger.info('Created GoCardless billing request flow', {
        billingRequestId: input.billingRequestId,
        flowId: flow.id,
      });

      return Result.ok({
        authorizationUrl: url,
        flowId: flow.id,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown GC error';
      this.logger.error('CreateBillingRequestFlow failed', {
        billingRequestId: input.billingRequestId,
        error: message,
      });
      return Result.fail(new Error(`Failed to create billing request flow: ${message}`));
    }
  }
}
