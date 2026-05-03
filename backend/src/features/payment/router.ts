import { Router, type RequestHandler, raw } from 'express';
import type { ILogger } from '../shared/logging';
import type { AppConfig } from '../shared/config';
import { asyncHandler } from '../shared/middleware/globalErrorHandler';
import { initGoCardlessClient } from '../shared/utils/gocardlessClient';
import { PaymentController } from './controllers/PaymentController';
import { SelectPlanUseCase } from './services/SelectPlanUseCase';
import { CreateBillingRequestUseCase } from './services/CreateBillingRequestUseCase';
import { CollectCustomerDetailsUseCase } from './services/CollectCustomerDetailsUseCase';
import { CollectBankAccountUseCase } from './services/CollectBankAccountUseCase';
import { CreateBillingRequestFlowUseCase } from './services/CreateBillingRequestFlowUseCase';
import { InitiateDirectDebitSetupUseCase } from './services/InitiateDirectDebitSetupUseCase';
import { HandleWebhookEventUseCase } from './services/HandleWebhookEventUseCase';
import { CreateInstalmentScheduleUseCase } from './services/CreateInstalmentScheduleUseCase';
import { PrismaAssessmentRepository } from '../assessment/repositories/PrismaAssessmentRepository';
import { PrismaCustomerRepository } from '../customer/repositories/PrismaCustomerRepository';

export function createPaymentRouter(
  config: AppConfig,
  logger: ILogger,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  // ============ DEPENDENCY INJECTION ============
  const assessmentRepository = new PrismaAssessmentRepository();
  const customerRepository = new PrismaCustomerRepository();
  const gocardless = initGoCardlessClient(config.gocardless.accessToken);

  const selectPlanUseCase = new SelectPlanUseCase(
    assessmentRepository,
    customerRepository,
    logger,
  );

  const createBillingRequestUseCase = new CreateBillingRequestUseCase(gocardless, logger);
  const collectCustomerDetailsUseCase = new CollectCustomerDetailsUseCase(gocardless, logger);
  const collectBankAccountUseCase = new CollectBankAccountUseCase(gocardless, logger);
  const createBillingRequestFlowUseCase = new CreateBillingRequestFlowUseCase(gocardless, logger);
  const createInstalmentScheduleUseCase = new CreateInstalmentScheduleUseCase(gocardless, logger);

  const initiateDirectDebitSetupUseCase = new InitiateDirectDebitSetupUseCase(
    customerRepository,
    createBillingRequestUseCase,
    collectCustomerDetailsUseCase,
    collectBankAccountUseCase,
    createBillingRequestFlowUseCase,
    logger,
  );

  // When a mandate becomes active, the webhook handler invokes this callback
  // to create the instalment schedule. For now this is a stub that logs;
  // wiring it to a real customer-aware flow comes in the next iteration.
  const onMandateActive = async (mandateId: string, billingRequestId: string | null) => {
    logger.info('Mandate active — instalment schedule creation pending', {
      mandateId,
      billingRequestId,
      note: 'Looking up customer/assessment to compute schedule deferred to next iteration',
    });
    // TODO: Resolve customer & selected plan from mandate's billing_request metadata,
    // then call createInstalmentScheduleUseCase.execute({ ... }).
    void createInstalmentScheduleUseCase;
  };

  const handleWebhookEventUseCase = new HandleWebhookEventUseCase(
    gocardless,
    logger,
    onMandateActive,
  );

  const controller = new PaymentController(
    selectPlanUseCase,
    initiateDirectDebitSetupUseCase,
    handleWebhookEventUseCase,
    config.server.frontendUrl,
    config.gocardless.webhookKey,
    logger,
  );

  // ============ ROUTES ============

  router.post(
    '/select-plan',
    authMiddleware,
    asyncHandler(controller.selectPlan.bind(controller)),
  );

  router.post(
    '/initiate-direct-debit',
    authMiddleware,
    asyncHandler(controller.initiateDirectDebit.bind(controller)),
  );

  // Webhook route — uses raw body for HMAC signature verification.
  // No auth middleware: GC verifies via Webhook-Signature header.
  router.post(
    '/webhook',
    raw({ type: 'application/json' }),
    asyncHandler(controller.handleWebhook.bind(controller)),
  );

  return router;
}
