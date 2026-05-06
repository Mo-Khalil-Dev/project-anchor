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
import { AssessmentReadyLocalDatabaseHandler } from '@/features/referenceData/infrastructure/handlers/AssessmentReadyLocalDatabaseHandler';
import { AssessmentReadySnsEventHandler } from '@/features/referenceData/infrastructure/handlers/AssessmentReadySnsEventHandler';
import type { IEventHandler } from '@/core/application/services/IEventHandler';
import type { AssessmentReadyForProcessingEvent } from '@/features/referenceData/domain/events/AssessmentReadyForProcessingEvent';
import type { IBackgroundJob } from '@/core/application/services/IBackgroundJob';
import { ProcessAssessmentJob } from '@/features/referenceData/infrastructure/services/jobs/ProcessAssessmentJob';
import { CompleteAssessmentUseCase } from '@/features/referenceData/application/useCases/CompleteAssessmentUseCase';
import { FailAssessmentUseCase } from '@/features/referenceData/application/useCases/FailAssessmentUseCase';

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
  const completeAssessmentUseCase = new CompleteAssessmentUseCase(assessmentRepository, logger);
  const failAssessmentUseCase = new FailAssessmentUseCase(assessmentRepository, logger);
  const processJobService = new ProcessAssessmentJob(
    prisma,
    assessmentRepository,
    logger,
    completeAssessmentUseCase,
    failAssessmentUseCase,
  );

  // Environment-based event handler selection
  const environment = process.env.NODE_ENV ?? 'development';
  let eventHandler: IEventHandler<AssessmentReadyForProcessingEvent>;

  if (environment === 'production') {
    // Production: use SNS for event publishing
    const awsRegion = process.env.AWS_REGION ?? 'us-east-1';
    const topicArn = process.env.AWS_ASSESSMENT_TOPIC_ARN;
    eventHandler = new AssessmentReadySnsEventHandler(logger, awsRegion, topicArn);
  } else {
    // Development/local: use local database handler for simple event processing
    const delayMs = parseInt(process.env.JOB_DISPATCH_DELAY_MS ?? '35000', 10);
    eventHandler = new AssessmentReadyLocalDatabaseHandler(
      processJobService as unknown as IBackgroundJob<string>,
      logger,
      delayMs
    );
  }

  const initiateOAuth = new InitiateBankOAuthUseCase(bankConnectionRepository, customerRepository, tinkService, logger);
  const handleCallback = new HandleBankOAuthCallbackUseCase(
    bankConnectionRepository,
    assessmentRepository,
    tinkService,
    prisma,
    logger,
    eventHandler
  );

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
