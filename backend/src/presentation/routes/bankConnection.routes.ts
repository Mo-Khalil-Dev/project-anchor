import { Router } from 'express';
import type { ILogger } from '../../shared/logging';
import type { AppConfig } from '../../shared/config';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware';
import { BankConnectionController } from '../controllers/BankConnectionController';
import { InitiateBankOAuthUseCase } from '../../application/bank-connection/InitiateBankOAuthUseCase';
import { HandleBankOAuthCallbackUseCase } from '../../application/bank-connection/HandleBankOAuthCallbackUseCase';
import { TinkOAuthService } from '../../infrastructure/services/TinkOAuthService';
import { PrismaBankConnectionRepository } from '../../infrastructure/persistence/PrismaBankConnectionRepository';

export function createBankConnectionRoutes(config: AppConfig, logger: ILogger) {
  const router = Router();
  const auth = createAuthMiddleware(config);

  const tinkService = new TinkOAuthService(config, logger);
  const repository = new PrismaBankConnectionRepository();

  const initiateOAuth = new InitiateBankOAuthUseCase(repository, tinkService, logger);
  const handleCallback = new HandleBankOAuthCallbackUseCase(repository, tinkService, logger);

  const controller = new BankConnectionController(initiateOAuth, handleCallback);

  router.post(
    '/initiate',
    auth,
    asyncHandler(controller.initiateOAuthFlow.bind(controller))
  );

  router.get(
    '/callback',
    asyncHandler(controller.handleCallback.bind(controller))
  );

  return router;
}
