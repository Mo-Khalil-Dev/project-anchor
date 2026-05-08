import { Request, Response } from 'express';
import { parse as parseGCWebhook, InvalidSignatureError } from 'gocardless-nodejs';
import type { ILogger } from '../../../shared/logging';
import type { AuthenticatedRequest } from '../../../shared/middleware/authenticateRequest';
import type { InitiateDirectDebitSetupUseCase } from '@/features/payment/application/usecases/InitiateDirectDebitSetupUseCase';
import type {
  HandleWebhookEventUseCase,
  WebhookEvent,
} from '@/features/payment/application/usecases/HandleWebhookEventUseCase';

export class PaymentController {
  constructor(
    private initiateDirectDebitSetupUseCase: InitiateDirectDebitSetupUseCase,
    private handleWebhookEventUseCase: HandleWebhookEventUseCase,
    private frontendUrl: string,
    private webhookSecret: string,
    private logger: ILogger
  ) {}

  /**
   * POST /api/payments/initiate-direct-debit
   * Body: { accountHolderName: string }
   * Returns: { authorizationUrl, billingRequestId, flowId }
   * Frontend redirects user to authorizationUrl.
   */
  async initiateDirectDebit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const { accountHolderName } = req.body as { accountHolderName?: string };
      if (!accountHolderName || accountHolderName.trim().length < 2) {
        res.status(400).json({ success: false, error: 'accountHolderName is required' });
        return;
      }

      const result = await this.initiateDirectDebitSetupUseCase.execute({
        userId,
        accountHolderName: accountHolderName.trim(),
        redirectUri: `${this.frontendUrl}/payment-plans/dd-callback`,
        exitUri: `${this.frontendUrl}/payment-plans/payment-setup`,
      });

      if (result.isFail) {
        const error = result.getError();
        const message = error?.message || 'Failed to initiate Direct Debit setup';
        this.logger.warn('initiateDirectDebit failed', { userId, error: message });
        res.status(400).json({ success: false, error: message });
        return;
      }

      res.status(200).json({ success: true, data: result.getOrThrow() });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('initiateDirectDebit controller error', { error: message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * POST /api/payments/webhook
   * Receives GoCardless webhook events. The route uses express.raw() middleware
   * so req.body is a Buffer used for HMAC signature verification.
   *
   * Header: Webhook-Signature
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.header('Webhook-Signature');
    if (!signature) {
      res.status(400).send('Missing Webhook-Signature header');
      return;
    }

    if (!this.webhookSecret) {
      this.logger.warn('GC webhook received but webhookSecret is not configured');
      res.status(503).send('Webhook handler not configured');
      return;
    }

    const rawBody = req.body as Buffer;

    let events: WebhookEvent[];
    try {
      // parseGCWebhook validates signature AND parses events in one go
      events = parseGCWebhook(rawBody, this.webhookSecret, signature) as unknown as WebhookEvent[];
    } catch (error) {
      if (
        error instanceof InvalidSignatureError ||
        (error as Error).name === 'InvalidSignatureError'
      ) {
        this.logger.warn('GC webhook rejected: invalid signature');
        res.status(498).send('Invalid signature');
        return;
      }
      this.logger.error('GC webhook parse failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(400).send('Invalid webhook payload');
      return;
    }

    // Process each event independently — return 200 even if one fails so GC doesn't retry the whole batch
    for (const event of events) {
      const result = await this.handleWebhookEventUseCase.execute(event);
      if (result.isFail) {
        this.logger.error('Webhook event handling failed', {
          eventId: event.id,
          error: result.getError()?.message,
        });
      }
    }

    res.status(200).send('OK');
  }
}
