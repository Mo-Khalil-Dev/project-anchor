import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import type { ILogger } from '../shared/logging';
import { asyncHandler } from '../shared/middleware/globalErrorHandler';
import { AssessmentController } from './controllers/AssessmentController';
import { PrismaAssessmentRepository } from './repositories/PrismaAssessmentRepository';

export function createAssessmentRouter(prisma: PrismaClient, logger: ILogger): Router {
  const router = Router();

  // ============ DEPENDENCY INJECTION ============
  const assessmentRepository = new PrismaAssessmentRepository(prisma);
  const controller = new AssessmentController(assessmentRepository, logger);

  // ============ ROUTES ============

  router.get(
    '/assessments/:assessmentId',
    asyncHandler(controller.getAssessment.bind(controller))
  );

  return router;
}
