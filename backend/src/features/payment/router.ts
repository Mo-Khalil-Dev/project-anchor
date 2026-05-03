import { Router, type RequestHandler } from 'express';
import type { ILogger } from '../shared/logging';
import { asyncHandler } from '../shared/middleware/globalErrorHandler';
import { PaymentController } from './controllers/PaymentController';
import { SelectPlanUseCase } from './services/SelectPlanUseCase';
import { PrismaAssessmentRepository } from '../assessment/repositories/PrismaAssessmentRepository';
import { PrismaCustomerRepository } from '../customer/repositories/PrismaCustomerRepository';

export function createPaymentRouter(
  logger: ILogger,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  // ============ DEPENDENCY INJECTION ============
  const assessmentRepository = new PrismaAssessmentRepository();
  const customerRepository = new PrismaCustomerRepository();

  const selectPlanUseCase = new SelectPlanUseCase(
    assessmentRepository,
    customerRepository,
    logger,
  );

  const controller = new PaymentController(selectPlanUseCase, logger);

  // ============ ROUTES ============

  router.post(
    '/select-plan',
    authMiddleware,
    asyncHandler(controller.selectPlan.bind(controller)),
  );

  return router;
}
