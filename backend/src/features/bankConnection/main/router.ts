import { Router, type RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import type { ILogger } from '../../shared/logging';
import type { AppConfig } from '../../shared/config';
import { asyncHandler } from '@/features/shared/middleware';
import { BankConnectionController } from '@/features/bankConnection/infrastructure/controllers/BankConnectionController';
import { InitiateBankConnectionUseCase } from '@/features/bankConnection/application/useCases/InitiateBankConnection';
import { FinalizeBankConnectionUseCase } from '@/features/bankConnection/application/useCases/FinalizeBankConnection';
import { TinkApiClient } from '@/features/bankConnection/infrastructure/services/Tink/TinkApiClient';
import { TinkFinancialDataProvider } from '@/features/bankConnection/infrastructure/services/Tink/TinkFinancialDataProvider';
import { PrismaBankConnectionRepository } from '@/features/bankConnection/infrastructure/repositories/PrismaBankConnectionRepository';
import { PrismaBankReportRepository } from '@/features/bankConnection/infrastructure/repositories/PrismaBankReportRepository';
import { PrismaAssessmentRepository } from '@/features/assessment/infrastructure/repositories/prisma/PrismaAssessmentRepository';
import { AssessmentReadyLocalDatabaseHandler } from '@/features/assessment/infrastructure/handlers/AssessmentReadyLocalDatabaseHandler';
import { AssessmentReadySnsEventHandler } from '@/features/assessment/infrastructure/handlers/AssessmentReadySnsEventHandler';
import type { IEventHandler } from '@/core/application/services/IEventHandler';
import type { AssessmentReadyForProcessingEvent } from '@/features/assessment/domain/events/AssessmentReadyForProcessingEvent';
import type { IBackgroundJob } from '@/core/application/services/IBackgroundJob';
import { ProcessAssessmentJob } from '@/features/assessment/infrastructure/services/jobs/ProcessAssessmentJob';
import { FailAssessmentUseCase } from '@/features/assessment/application/useCases/FailAssessment';
import { PrismaCustomerRepository } from '@/features/customer/infrastructure/repositories/PrismaCustomerRepository';

export function createBankConnectionRouter(
  config: AppConfig,
  logger: ILogger,
  authMiddleware: RequestHandler,
  prisma: PrismaClient
): Router {
  const router = Router();

  // ============ DEPENDENCY INJECTION ============
  const tinkService = new TinkApiClient(config, logger);
  const bankDataProvider = new TinkFinancialDataProvider(tinkService, logger);
  const bankConnectionRepository = new PrismaBankConnectionRepository();
  const bankReportRepository = new PrismaBankReportRepository(prisma);
  const customerRepository = new PrismaCustomerRepository();
  const assessmentRepository = new PrismaAssessmentRepository(prisma, logger);
  const failAssessmentUseCase = new FailAssessmentUseCase(assessmentRepository, logger);
  const processJobService = new ProcessAssessmentJob(
    assessmentRepository,
    bankReportRepository,
    logger,
    failAssessmentUseCase
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

  const initiateOAuth = new InitiateBankConnectionUseCase(
    bankConnectionRepository,
    customerRepository,
    tinkService,
    logger
  );
  const handleCallback = new FinalizeBankConnectionUseCase(
    bankConnectionRepository,
    assessmentRepository,
    bankDataProvider,
    prisma,
    logger,
    eventHandler
  );

  const controller = new BankConnectionController(
    initiateOAuth,
    handleCallback,
    customerRepository
  );

  // ============ ROUTES ============

  router.post(
    '/initiate',
    authMiddleware,
    asyncHandler(controller.initiateOAuthFlow.bind(controller))
  );

  router.get('/callback', asyncHandler(controller.handleCallback.bind(controller)));

  return router;
}
