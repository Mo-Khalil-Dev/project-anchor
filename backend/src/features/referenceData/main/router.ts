import type { Router, RequestHandler } from 'express';
import { Router as ExpressRouter } from 'express';
import type { ILogger } from '../../shared/logging';
import { PrismaCustomerRepository } from '../../customer/repositories/PrismaCustomerRepository';
import { PrismaBankConnectionRepository } from '../../bankConnection/repositories/PrismaBankConnectionRepository';
import { PrismaAssessmentRepository } from '../infrastructure/repositories/prisma/PrismaAssessmentRepository';
import { ReferenceDataController, type AuthenticatedRequest } from '@/features/referenceData/infrastructure/controllers/ReferenceDataController';
import { GetReferenceDataUseCase } from '../application/useCases/GetReferenceDataUseCase';
import { CompleteAssessmentUseCase } from '../application/useCases/CompleteAssessmentUseCase';
import { FailAssessmentUseCase } from '../application/useCases/FailAssessmentUseCase';
import { SelectPaymentPlanUseCase } from '../application/useCases/SelectPaymentPlanUseCase';
import { asyncHandler } from '../../shared/middleware/globalErrorHandler';

export function createReferenceDataRouter(
  logger: ILogger,
  authenticateRequest: RequestHandler,
): Router {
  const router = ExpressRouter();

  // ============ DEPENDENCY INJECTION ============
  // Create repositories
  const customerRepository = new PrismaCustomerRepository();
  const bankConnectionRepository = new PrismaBankConnectionRepository();
  const assessmentRepository = new PrismaAssessmentRepository(logger);

  // Create use cases
  const getReferenceDataUseCase = new GetReferenceDataUseCase(
    customerRepository,
    bankConnectionRepository,
    assessmentRepository,
    logger,
  );
  const completeAssessmentUseCase = new CompleteAssessmentUseCase(assessmentRepository, logger);
  const failAssessmentUseCase = new FailAssessmentUseCase(assessmentRepository, logger);
  const selectPaymentPlanUseCase = new SelectPaymentPlanUseCase(assessmentRepository, logger);

  // Create controller
  const controller = new ReferenceDataController(
    getReferenceDataUseCase,
    completeAssessmentUseCase,
    failAssessmentUseCase,
    selectPaymentPlanUseCase,
  );

  // ============ ROUTES ============
  /**
   * GET /api/reference-data
   * Protected: requires authentication
   * Returns consolidated reference data for authenticated user
   */
  router.get(
    '/',
    authenticateRequest,
    asyncHandler(async (req, res) => {
      await controller.getReferenceData(req, res);
    }),
  );

  /**
   * POST /api/reference-data/assessments/:assessmentId/complete
   * Protected: requires authentication
   * Marks assessment as completed
   */
  router.post(
    '/assessments/:assessmentId/complete',
    authenticateRequest,
    asyncHandler(async (req, res) => {
      await controller.completeAssessment(req as AuthenticatedRequest, res);
    }),
  );

  /**
   * POST /api/reference-data/assessments/:assessmentId/fail
   * Protected: requires authentication
   * Marks assessment as failed with reason
   */
  router.post(
    '/assessments/:assessmentId/fail',
    authenticateRequest,
    asyncHandler(async (req, res) => {
      await controller.failAssessment(req as AuthenticatedRequest, res);
    }),
  );

  /**
   * POST /api/reference-data/assessments/:assessmentId/select-plan
   * Protected: requires authentication
   * Records selected payment plan
   */
  router.post(
    '/assessments/:assessmentId/select-plan',
    authenticateRequest,
    asyncHandler(async (req, res) => {
      await controller.selectPaymentPlan(req as AuthenticatedRequest, res);
    }),
  );

  return router;
}
