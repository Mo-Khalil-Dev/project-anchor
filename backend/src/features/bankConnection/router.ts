import { Router, type RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import type { ILogger } from '../shared/logging';
import type { AppConfig } from '../shared/config';
import { asyncHandler } from '../shared/middleware/globalErrorHandler';
import { BankConnectionController } from './controllers/BankConnectionController';
import { InitiateBankOAuthUseCase } from './services/InitiateBankOAuthUseCase';
import { HandleBankOAuthCallbackUseCase } from './services/HandleBankOAuthCallbackUseCase';
import { TinkGateway } from './services/TinkGateway';
import { TinkBankDataProvider } from './services/TinkBankDataProvider';
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
  const tinkService = new TinkGateway(config, logger);
  const bankDataProvider = new TinkBankDataProvider(tinkService, logger);
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

  const environment = process.env.NODE_ENV ?? 'development';
  let eventHandler: IEventHandler<AssessmentReadyForProcessingEvent>;

  if (environment === 'production') {
    const awsRegion = process.env.AWS_REGION ?? 'us-east-1';
    const topicArn = process.env.AWS_ASSESSMENT_TOPIC_ARN;
    eventHandler = new AssessmentReadySnsEventHandler(logger, awsRegion, topicArn);
  } else {
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
    bankDataProvider,
    prisma,
    logger,
    eventHandler,
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
