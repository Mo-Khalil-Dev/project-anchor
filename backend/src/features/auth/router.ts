import { Router } from 'express';
import { ILogger } from '../shared/logging';
import { PrismaClient } from '@prisma/client';

export function createAuthRouter(
  authProvider: any,
  prisma: PrismaClient,
  logger: ILogger
): Router {
  const router = Router();

  // Auth routes will be added here

  return router;
}
