import { Router, RequestHandler } from 'express';
import type { ILogger } from '../../shared/logging';
import type { AppConfig } from '../../shared/config';
import { asyncHandler } from '../middleware';
import { BankConnectionController } from '../controllers/BankConnectionController';
import { InitiateBankOAuthUseCase } from '../../application/bank-connection/InitiateBankOAuthUseCase';
import { HandleBankOAuthCallbackUseCase } from '../../application/bank-connection/HandleBankOAuthCallbackUseCase';
import { TinkOAuthService } from '../../infrastructure/services/TinkOAuthService';
import { PrismaBankConnectionRepository } from '../../infrastructure/persistence/PrismaBankConnectionRepository';
import { PrismaCustomerRepository } from '../../infrastructure/persistence/PrismaCustomerRepository';
import { PrismaAssessmentRepository } from '../../infrastructure/persistence/PrismaAssessmentRepository';
import { ProcessAssessmentJobService } from '../../application/services/ProcessAssessmentJobService';
import { LocalJobDispatcher } from '../../application/jobs/LocalJobDispatcher';
import { prisma } from '../../utils/db';

export function createBankConnectionRoutes(config: AppConfig, logger: ILogger, authMiddleware: RequestHandler) {
  const router = Router();
  const tinkService = new TinkOAuthService(config, logger);
  const bankConnectionRepository = new PrismaBankConnectionRepository();
  const customerRepository = new PrismaCustomerRepository();
  const assessmentRepository = new PrismaAssessmentRepository(prisma);
  const processJobService = new ProcessAssessmentJobService(prisma, assessmentRepository, logger);
  const delayMs = parseInt(process.env.JOB_DISPATCH_DELAY_MS ?? '35000', 10);
  const jobDispatcher = new LocalJobDispatcher(processJobService, logger, delayMs);

  const initiateOAuth = new InitiateBankOAuthUseCase(bankConnectionRepository, customerRepository, tinkService, logger);
  const handleCallback = new HandleBankOAuthCallbackUseCase(bankConnectionRepository, tinkService, prisma, logger, jobDispatcher);

  const controller = new BankConnectionController(initiateOAuth, handleCallback, customerRepository);

  // Protected: requires a linked customer account
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
