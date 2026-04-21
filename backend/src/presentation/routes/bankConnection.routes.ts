import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
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

export function createBankConnectionRoutes(config: AppConfig, logger: ILogger) {
  const router = Router();

  const prisma = new PrismaClient();
  const tinkService = new TinkOAuthService(config, logger);
  const bankConnectionRepository = new PrismaBankConnectionRepository();
  const customerRepository = new PrismaCustomerRepository();
  const assessmentRepository = new PrismaAssessmentRepository(prisma);
  const processJobService = new ProcessAssessmentJobService(prisma, assessmentRepository, logger);

  const initiateOAuth = new InitiateBankOAuthUseCase(bankConnectionRepository, customerRepository, tinkService, logger);
  const handleCallback = new HandleBankOAuthCallbackUseCase(bankConnectionRepository, tinkService, prisma, logger, processJobService);

  const controller = new BankConnectionController(initiateOAuth, handleCallback);

  router.post(
    '/initiate',
    asyncHandler(controller.initiateOAuthFlow.bind(controller))
  );

  router.get(
    '/callback',
    asyncHandler(controller.handleCallback.bind(controller))
  );

  return router;
}
