import { ILogger } from '@/features/shared/logging';
import { RequestHandler, Router as ExpressRouter, Router } from 'express';
import { SelectPaymentPlanUseCase } from '@/features/assessment/application/useCases/SelectPaymentPlanUseCase';
import { PrismaAssessmentRepository } from '@/features/assessment/infrastructure/repositories/prisma/PrismaAssessmentRepository';
import prisma from '@/features/shared/utils/db';
import { AuthenticatedRequest } from '@/features/shared/types/auth';
import { AssessmentController } from '@/features/assessment/infrastructure/controllers/assessmentController';
import { asyncHandler } from '@/features/shared/middleware';

export const createAssessmentRouter = (
  logger: ILogger,
  authenticateRequest: RequestHandler
): Router => {
  const router = ExpressRouter();

  // ============ DEPENDENCY INJECTION ============
  // Create repositories
  const assessmentRepository = new PrismaAssessmentRepository(prisma, logger);
  // Create use cases
  const selectPaymentPlanUseCase = new SelectPaymentPlanUseCase(assessmentRepository, logger);

  // Create controller
  const controller = new AssessmentController(selectPaymentPlanUseCase);

  // ============ ROUTES ============
  /**
   * POST /api/reference-data/assessments/:assessmentId/select-plan
   * Protected: requires authentication
   * Records selected payment plan
   */
  router.post(
    '/:assessmentId/select-plan',
    authenticateRequest,
    asyncHandler(async (req, res) => {
      await controller.selectPaymentPlan(req as AuthenticatedRequest, res);
    })
  );

  return router;
};
