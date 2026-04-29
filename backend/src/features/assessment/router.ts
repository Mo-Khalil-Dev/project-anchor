import { Router } from 'express';
import { ILogger } from '../shared/logging';
import { PrismaClient } from '@prisma/client';

export function createAssessmentRouter(
  prisma: PrismaClient,
  logger: ILogger
): Router {
  const router = Router();

  // Assessment routes will be added here

  return router;
}
