import { Router } from 'express';
import type { ILogger } from '../../shared/logging';
import type { AppConfig } from '../../shared/config';
import { asyncHandler } from '../middleware';
import { BankConnectionController } from '../controllers/BankConnectionController';
import { InitiateBankOAuthUseCase } from '../../application/bank-connection/InitiateBankOAuthUseCase';
import { HandleBankOAuthCallbackUseCase } from '../../application/bank-connection/HandleBankOAuthCallbackUseCase';
import { TinkOAuthService } from '../../infrastructure/services/TinkOAuthService';
import { PrismaBankConnectionRepository } from '../../infrastructure/persistence/PrismaBankConnectionRepository';
import { PrismaCustomerRepository } from '../../infrastructure/persistence/PrismaCustomerRepository';

export function createBankConnectionRoutes(config: AppConfig, logger: ILogger) {
  const router = Router();

  const tinkService = new TinkOAuthService(config, logger);
  const bankConnectionRepository = new PrismaBankConnectionRepository();
  const customerRepository = new PrismaCustomerRepository();

  const initiateOAuth = new InitiateBankOAuthUseCase(bankConnectionRepository, customerRepository, tinkService, logger);
  const handleCallback = new HandleBankOAuthCallbackUseCase(bankConnectionRepository, tinkService, logger);

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
