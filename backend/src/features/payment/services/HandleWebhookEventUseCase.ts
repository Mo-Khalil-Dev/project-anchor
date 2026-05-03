import type { GoCardlessClient } from 'gocardless-nodejs';
import { Result } from '../../shared/result';
import type { ILogger } from '../../shared/logging';

export interface WebhookEvent {
  id: string;
  resource_type: string;
  action: string;
  links?: {
    mandate?: string;
    payment?: string;
    subscription?: string;
    billing_request?: string;
    [key: string]: string | undefined;
  };
  details?: Record<string, unknown>;
  created_at?: string;
}

/**
 * HandleWebhookEventUseCase
 *
 * Dispatches a single GoCardless webhook event to the right handler.
 * For Phase 1 we focus on mandate events:
 *   - mandates.created
 *   - mandates.active (mandate fully authorized — ready for payments)
 *   - mandates.failed
 *   - mandates.cancelled
 *
 * When a mandate becomes ACTIVE, we trigger instalment schedule creation
 * (deferred — the wiring happens in router.ts).
 */
export class HandleWebhookEventUseCase {
  constructor(
    private gocardless: GoCardlessClient,
    private logger: ILogger,
    private onMandateActive?: (mandateId: string, billingRequestId: string | null) => Promise<void>,
  ) {}

  async execute(event: WebhookEvent): Promise<Result<void, Error>> {
    this.logger.info('Processing GC webhook event', {
      eventId: event.id,
      resourceType: event.resource_type,
      action: event.action,
    });

    if (event.resource_type === 'mandates') {
      return this.handleMandateEvent(event);
    }

    if (event.resource_type === 'billing_requests') {
      return this.handleBillingRequestEvent(event);
    }

    // Other resource types (payments, subscriptions, etc.) — log only for now
    return Result.ok(undefined);
  }

  private async handleMandateEvent(event: WebhookEvent): Promise<Result<void, Error>> {
    const mandateId = event.links?.mandate;
    if (!mandateId) {
      this.logger.warn('Mandate event missing mandate link', { eventId: event.id });
      return Result.ok(undefined);
    }

    if (event.action === 'active' || event.action === 'created') {
      try {
        // Fetch mandate to get linked billing_request and customer
        const mandate = await this.gocardless.mandates.find(mandateId);
        const billingRequestId = (mandate as any).links?.customer_bank_account
          ? null
          : null; // TODO: resolve via billing_request lookup if needed

        this.logger.info('Mandate event received', {
          eventId: event.id,
          mandateId,
          action: event.action,
          status: (mandate as any).status,
        });

        if (event.action === 'active' && this.onMandateActive) {
          await this.onMandateActive(mandateId, billingRequestId);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Failed to process mandate event', {
          eventId: event.id,
          mandateId,
          error: message,
        });
        return Result.fail(new Error(`Mandate event processing failed: ${message}`));
      }
    }

    return Result.ok(undefined);
  }

  private async handleBillingRequestEvent(event: WebhookEvent): Promise<Result<void, Error>> {
    this.logger.info('Billing request event received', {
      eventId: event.id,
      action: event.action,
      billingRequestId: event.links?.billing_request,
    });
    return Result.ok(undefined);
  }
}
