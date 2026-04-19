import { Router } from 'express';
import { z } from 'zod';
import type { ILogger } from '../../shared/logging';
import type { AppConfig } from '../../shared/config';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { asyncHandler, validateRequest } from '../middleware';
import { BankConnectionController } from '../controllers/BankConnectionController';
import { InitiateBankOAuthUseCase } from '../../application/bank-connection/InitiateBankOAuthUseCase';
import { HandleBankOAuthCallbackUseCase } from '../../application/bank-connection/HandleBankOAuthCallbackUseCase';
import { PollBankDataUseCase } from '../../application/bank-connection/PollBankDataUseCase';
import { TinkOAuthService } from '../../infrastructure/services/TinkOAuthService';
import { PrismaBankConnectionRepository } from '../../infrastructure/persistence/PrismaBankConnectionRepository';

const statusSchema = z.object({
  params: z.object({
    connectionId: z.string().uuid(),
  }),
});

export function createBankConnectionRoutes(config: AppConfig, logger: ILogger) {
  const router = Router();
  const auth = createAuthMiddleware(config);

  const tinkService = new TinkOAuthService(config, logger);
  const repository = new PrismaBankConnectionRepository();

  const initiateOAuth = new InitiateBankOAuthUseCase(repository, tinkService, logger);
  const handleCallback = new HandleBankOAuthCallbackUseCase(repository, tinkService, logger);
  const pollData = new PollBankDataUseCase(repository, tinkService, logger);

  const controller = new BankConnectionController(initiateOAuth, handleCallback, pollData);

  router.post(
    '/initiate',
    auth,
    asyncHandler(controller.initiateOAuthFlow.bind(controller))
  );

  router.get(
    '/callback',
    asyncHandler(controller.handleCallback.bind(controller))
  );

  router.get(
    '/:connectionId/status',
    auth,
    validateRequest(statusSchema),
    asyncHandler(controller.pollStatus.bind(controller))
  );

  return router;
}
