import { Router } from 'express';
import { ILogger } from '../shared/logging';
import { PrismaClient } from '@prisma/client';
import { RequestHandler } from 'express';

export function createCustomerRouter(
  prisma: PrismaClient,
  logger: ILogger,
  authMiddleware?: RequestHandler
): Router {
  const router = Router();

  // Customer routes will be added here

  return router;
}
