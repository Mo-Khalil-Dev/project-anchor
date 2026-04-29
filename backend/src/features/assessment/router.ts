import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import type { ILogger } from '../shared/logging';
import { asyncHandler } from '../shared/middleware/globalErrorHandler';
import { AssessmentController } from './controllers/AssessmentController';
import { PrismaAssessmentRepository } from './repositories/PrismaAssessmentRepository';
import { GetCurrentAssessmentUseCase } from './services/GetCurrentAssessmentUseCase';

export function createAssessmentRouter(
  prisma: PrismaClient,
  logger: ILogger,
  authMiddleware?: any, // Auth middleware for protected routes
): Router {
  const router = Router();

  // ============ DEPENDENCY INJECTION ============
  const assessmentRepository = new PrismaAssessmentRepository(prisma);
  const getCurrentAssessmentUseCase = new GetCurrentAssessmentUseCase(
    assessmentRepository,
    logger,
  );
  const controller = new AssessmentController(
    assessmentRepository,
    logger,
    getCurrentAssessmentUseCase,
  );

  // ============ ROUTES ============

  // Public endpoint (requires ID parameter)
  router.get(
    '/assessments/:assessmentId',
    asyncHandler(controller.getAssessment.bind(controller))
  );

  // Protected endpoint - Reference Data (current user's latest assessment)
  // Full path: GET /api/me/assessment
  if (authMiddleware) {
    router.get(
      '/me/assessment',
      authMiddleware,
      asyncHandler(controller.getCurrentAssessment.bind(controller))
    );
  } else {
    router.get(
      '/me/assessment',
      asyncHandler(controller.getCurrentAssessment.bind(controller))
    );
  }

  return router;
}
