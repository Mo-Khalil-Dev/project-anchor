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
import { ProcessMandateActiveUseCase } from './services/ProcessMandateActiveUseCase';
import { PrismaAssessmentRepository } from '../assessment/repositories/PrismaAssessmentRepository';
import { PrismaCustomerRepository } from '../customer/repositories/PrismaCustomerRepository';
import { PrismaPaymentRepository } from './repositories/PrismaPaymentRepository';

export function createPaymentRouter(
  config: AppConfig,
  logger: ILogger,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  // ============ DEPENDENCY INJECTION ============
  const assessmentRepository = new PrismaAssessmentRepository();
  const customerRepository = new PrismaCustomerRepository();
  const paymentRepository = new PrismaPaymentRepository();
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
    assessmentRepository,
    createBillingRequestUseCase,
    collectCustomerDetailsUseCase,
    collectBankAccountUseCase,
    createBillingRequestFlowUseCase,
    logger,
  );

  const processMandateActiveUseCase = new ProcessMandateActiveUseCase(
    gocardless,
    assessmentRepository,
    paymentRepository,
    createInstalmentScheduleUseCase,
    logger,
  );

  // When a mandate becomes active, run the full post-authorization flow:
  // resolve our records, persist the mandate, and create the instalment schedule.
  const onMandateActive = async (mandateId: string) => {
    const result = await processMandateActiveUseCase.execute(mandateId);
    if (result.isFail) {
      logger.error('ProcessMandateActive failed', {
        mandateId,
        error: result.getError()?.message,
      });
    }
  };

  const handleWebhookEventUseCase = new HandleWebhookEventUseCase(logger, onMandateActive);

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
