import { ILogger } from '@/features/shared/logging';
import { RequestHandler, Router as ExpressRouter, Router } from 'express';
import { SelectPlanUseCase } from '@/features/assessment/application/useCases/SelectPlan';
import { PrismaAssessmentRepository } from '@/features/assessment/infrastructure/repositories/prisma/PrismaAssessmentRepository';
import { PrismaCustomerRepository } from '@/features/customer/infrastructure/repositories/PrismaCustomerRepository';
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
  const customerRepository = new PrismaCustomerRepository();

  // Create use cases
  const selectPlanUseCase = new SelectPlanUseCase(assessmentRepository, customerRepository, logger);

  // Create controller
  const controller = new AssessmentController(selectPlanUseCase, logger);

  // ============ ROUTES ============
  /**
   * POST /api/assessments/select-plan
   * Protected: requires authentication
   * Body: { planType: 'Conservative' | 'Balanced' | 'Aggressive' }
   * Persists the customer's chosen payment plan on their latest assessment.
   */
  router.post(
    '/select-plan',
    authenticateRequest,
    asyncHandler(async (req, res) => {
      await controller.selectPlan(req as AuthenticatedRequest, res);
    })
  );

  return router;
};
