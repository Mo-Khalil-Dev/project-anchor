import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AssessmentController } from '../controllers/AssessmentController';
import { PrismaAssessmentRepository } from '../../infrastructure/persistence/PrismaAssessmentRepository';
import { getLogger } from '../../shared/logging';

export function createAssessmentRoutes() {
  const router = Router();

  const prisma = new PrismaClient();
  const assessmentRepository = new PrismaAssessmentRepository(prisma);
  const logger = getLogger();
  const controller = new AssessmentController(assessmentRepository, logger);

  router.get('/assessments/:assessmentId', (req, res) => controller.getAssessment(req, res));

  return router;
}
