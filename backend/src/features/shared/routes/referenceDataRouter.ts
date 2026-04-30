import type { Router, RequestHandler } from 'express';
import { Router as ExpressRouter } from 'express';
import type { ILogger } from '../logging';
import { PrismaCustomerRepository } from '../../customer/repositories/PrismaCustomerRepository';
import { PrismaBankConnectionRepository } from '../../bankConnection/repositories/PrismaBankConnectionRepository';
import { PrismaAssessmentRepository } from '../../assessment/repositories/PrismaAssessmentRepository';
import { ReferenceDataController } from '../controllers/ReferenceDataController';
import { GetReferenceDataUseCase } from '../services/GetReferenceDataUseCase';
import { asyncHandler } from '../middleware/globalErrorHandler';

export function createReferenceDataRouter(
  logger: ILogger,
  authenticateRequest: RequestHandler,
): Router {
  const router = ExpressRouter();

  // ============ DEPENDENCY INJECTION ============
  // Create repositories
  const customerRepository = new PrismaCustomerRepository();
  const bankConnectionRepository = new PrismaBankConnectionRepository();
  const assessmentRepository = new PrismaAssessmentRepository();

  // Create use case
  const getReferenceDataUseCase = new GetReferenceDataUseCase(
    customerRepository,
    bankConnectionRepository,
    assessmentRepository,
    logger,
  );

  // Create controller
  const controller = new ReferenceDataController(getReferenceDataUseCase);

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

  return router;
}
