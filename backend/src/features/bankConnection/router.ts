import { Router } from 'express';
import { ILogger } from '../shared/logging';
import { PrismaClient } from '@prisma/client';
import { RequestHandler } from 'express';
import { AppConfig } from '../shared/config';

export function createBankConnectionRouter(
  config: AppConfig,
  logger: ILogger,
  authMiddleware?: RequestHandler,
  prisma?: PrismaClient
): Router {
  const router = Router();

  // Bank connection routes will be added here

  return router;
}
