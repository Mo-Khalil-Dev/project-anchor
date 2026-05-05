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
import { PrismaAssessmentRepository } from '@/features/referenceData/infrastructure/repositories/prisma/PrismaAssessmentRepository';
import { ProcessAssessmentJob } from '@/features/referenceData/infrastructure/services/jobs/ProcessAssessmentJob';
import { LocalJobDispatcher } from '../../core/infrastructure/jobDispatchers/LocalJobDispatcher';
import { AwsSqsJobDispatcher } from '../../core/infrastructure/jobDispatchers/AwsSqsJobDispatcher';
import type { IJobDispatcher } from '../../core/application/services/IJobDispatcher';

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
  const assessmentRepository = new PrismaAssessmentRepository(logger);
  const processJobService = new ProcessAssessmentJob(prisma, assessmentRepository, logger);
  const dispatchMode = process.env.JOB_DISPATCH_MODE ?? 'local';
  const delayMs = parseInt(process.env.JOB_DISPATCH_DELAY_MS ?? '35000', 10);
  const sqsQueueUrl = process.env.AWS_BACKGROUND_JOB_QUEUE_URL;

  let jobDispatcher: IJobDispatcher;
  if (dispatchMode === 'sqs') {
    if (!sqsQueueUrl) {
      throw new Error('AWS_BACKGROUND_JOB_QUEUE_URL must be set when JOB_DISPATCH_MODE=sqs');
    }
    jobDispatcher = new AwsSqsJobDispatcher(sqsQueueUrl, logger);
  } else {
    jobDispatcher = new LocalJobDispatcher(processJobService, logger, delayMs);
  }

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
