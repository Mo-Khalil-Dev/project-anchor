import { Router, type RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import type { ILogger } from '../shared/logging';
import type { AppConfig } from '../shared/config';
import { asyncHandler } from '../shared/middleware/globalErrorHandler';
import { BankConnectionController } from './controllers/BankConnectionController';
import { InitiateBankOAuthUseCase } from './services/InitiateBankOAuthUseCase';
import { HandleBankOAuthCallbackUseCase } from './services/HandleBankOAuthCallbackUseCase';
import { TinkOAuthService } from './services/TinkOAuthService';
import { PrismaBankConnectionRepository } from './repositories/PrismaBankConnectionRepository';
import { PrismaCustomerRepository } from '../customer/repositories/PrismaCustomerRepository';
import { PrismaAssessmentRepository } from '../assessment/repositories/PrismaAssessmentRepository';
import { ProcessAssessmentJobService } from '../assessment/services/ProcessAssessmentJobService';
import { LocalJobDispatcher } from '../assessment/services/LocalJobDispatcher';

export function createBankConnectionRouter(
  config: AppConfig,
  logger: ILogger,
  authMiddleware: RequestHandler,
  prisma: PrismaClient
): Router {
  const router = Router();

  // ============ DEPENDENCY INJECTION ============
  const tinkService = new TinkOAuthService(config, logger);
  const bankConnectionRepository = new PrismaBankConnectionRepository();
  const customerRepository = new PrismaCustomerRepository();
  const assessmentRepository = new PrismaAssessmentRepository();
  const processJobService = new ProcessAssessmentJobService(prisma, assessmentRepository, logger);
  const delayMs = parseInt(process.env.JOB_DISPATCH_DELAY_MS ?? '35000', 10);
  const jobDispatcher = new LocalJobDispatcher(processJobService, logger, delayMs);

  const initiateOAuth = new InitiateBankOAuthUseCase(bankConnectionRepository, customerRepository, tinkService, logger);
  const handleCallback = new HandleBankOAuthCallbackUseCase(bankConnectionRepository, tinkService, prisma, logger, jobDispatcher);

  const controller = new BankConnectionController(initiateOAuth, handleCallback, customerRepository);

  // ============ ROUTES ============

  router.post(
    '/initiate',
    authMiddleware,
    asyncHandler(controller.initiateOAuthFlow.bind(controller))
  );

  router.get(
    '/callback',
    asyncHandler(controller.handleCallback.bind(controller))
  );

  return router;
}
