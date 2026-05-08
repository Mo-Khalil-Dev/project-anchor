import type { Router, RequestHandler } from 'express';
import { Router as ExpressRouter } from 'express';
import type { ILogger } from '../../shared/logging';
import { PrismaBankConnectionRepository } from '@/features/bankConnection/infrastructure/repositories/PrismaBankConnectionRepository';
import { PrismaAssessmentRepository } from '@/features/assessment/infrastructure/repositories/prisma/PrismaAssessmentRepository';
import { GetReferenceDataUseCase } from '../application/useCases/GetReferenceDataUseCase';
import { CompleteAssessmentUseCase } from '@/features/assessment/application/useCases/CompleteAssessmentUseCase';
import { FailAssessmentUseCase } from '@/features/assessment/application/useCases/FailAssessmentUseCase';

import { asyncHandler } from '@/features/shared/middleware';
import { ReferenceDataController } from '@/features/referenceData/infrastructure/controllers/ReferenceDataController';
import prisma from '@/features/shared/utils/db';
import { PrismaCustomerRepository } from '@/features/customer/infrastructure/repositories/PrismaCustomerRepository';

export function createReferenceDataRouter(
  logger: ILogger,
  authenticateRequest: RequestHandler
): Router {
  const router = ExpressRouter();

  // ============ DEPENDENCY INJECTION ============
  // Create repositories
  const customerRepository = new PrismaCustomerRepository();
  const bankConnectionRepository = new PrismaBankConnectionRepository();
  const assessmentRepository = new PrismaAssessmentRepository(prisma, logger);

  // Create use cases
  const getReferenceDataUseCase = new GetReferenceDataUseCase(
    customerRepository,
    bankConnectionRepository,
    assessmentRepository,
    logger
  );
  const completeAssessmentUseCase = new CompleteAssessmentUseCase(assessmentRepository, logger);
  const failAssessmentUseCase = new FailAssessmentUseCase(assessmentRepository, logger);

  // Create controller
  const controller = new ReferenceDataController(
    getReferenceDataUseCase,
    completeAssessmentUseCase,
    failAssessmentUseCase
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
    })
  );

  return router;
}
