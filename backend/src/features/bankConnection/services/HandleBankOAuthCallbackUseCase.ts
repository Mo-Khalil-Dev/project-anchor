import { PrismaClient } from '@prisma/client';
import { Result } from '../../shared/result';
import type { IBankConnectionRepository } from '../types/bankConnection.types';
import type { ILogger } from '../../shared/logging';
import type { TinkOAuthService } from './TinkOAuthService';
import { BankDataExtractionService, IncomeBreakdown, ExpenseBreakdown } from './BankDataExtractionService';
import type { IEventHandler } from '../../../core/application/services/IEventHandler';
import type { AssessmentReadyForProcessingEvent } from '@/features/referenceData/domain/events/AssessmentReadyForProcessingEvent';
import { Assessment } from '@/features/referenceData/domain/entities';
import type { IAssessmentRepository } from '@/features/referenceData/domain/entities';

export class HandleBankOAuthCallbackUseCase {
  constructor(
    private repository: IBankConnectionRepository,
    private assessmentRepository: IAssessmentRepository,
    private tinkService: TinkOAuthService,
    private prisma: PrismaClient,
    private logger: ILogger,
    private eventHandler: IEventHandler<AssessmentReadyForProcessingEvent>,
  ) { }

  async execute(
    code: string,
    state: string
  ): Promise<
    Result<
      {
        connectionId: string;
        totalExpenses: number;
        totalIncome: number;
        assessmentId: string;
        incomeBreakdown: IncomeBreakdown;
        expenseBreakdown: ExpenseBreakdown;
      },
      Error
    >
  > {
    try {
      const connResult = await this.repository.findByOAuthState(state);
      if (connResult.isFail) {
        return Result.fail(connResult.getError() || new Error('Unknown error'));
      }

      const connection = connResult.getOrThrow();
      if (!connection) {
        return Result.fail(new Error('Invalid OAuth state token'));
      }

      const customer = await this.prisma.customer.findUnique({
        where: { id: connection.customerId },
      });
      if (!customer) {
        return Result.fail(new Error('Customer not found'));
      }

      // Get access token for API requests
      const tokenResult = await this.tinkService.exchangeCodeForAccessToken();
      if (tokenResult.isFail) {
        return Result.fail(tokenResult.getError() || new Error('Unknown error'));
      }

      const accessToken = tokenResult.getOrThrow();

      // Fetch both income and expense check data
      const incomeResult = await this.tinkService.getIncomeReport(code);
      if (incomeResult.isFail) {
        return Result.fail(incomeResult.getError() || new Error('Failed to fetch income data'));
      }

      const expenseResult = await this.tinkService.getExpenseCheck(code, accessToken);
      if (expenseResult.isFail) {
        return Result.fail(expenseResult.getError() || new Error('Failed to fetch expense data'));
      }

      const incomeData = incomeResult.getOrThrow();
      const expenseData = expenseResult.getOrThrow();

      // Extract key figures
      const extractedIncomeResult = BankDataExtractionService.extractIncome(incomeData);
      if (extractedIncomeResult.isFail) {
        return Result.fail(
          extractedIncomeResult.getError() || new Error('Failed to extract income figures')
        );
      }

      const extractedExpenseResult = BankDataExtractionService.extractExpenses(expenseData);
      if (extractedExpenseResult.isFail) {
        return Result.fail(
          extractedExpenseResult.getError() || new Error('Failed to extract expense figures')
        );
      }

      const income = extractedIncomeResult.getOrThrow();
      const expenses = extractedExpenseResult.getOrThrow();

      // Save raw JSONs to BankReports table
      await this.prisma.bankReports.upsert({
        where: { bankConnectionId: connection.id },
        update: {
          incomeJson: JSON.stringify(incomeData),
          expensesJson: JSON.stringify(expenseData),
          totalMonthlyIncome: income.total,
          totalMonthlyExpenses: expenses.total,
          createdAt: new Date(),
        },
        create: {
          bankConnectionId: connection.id,
          incomeJson: JSON.stringify(incomeData),
          expensesJson: JSON.stringify(expenseData),
          totalMonthlyIncome: income.total,
          totalMonthlyExpenses: expenses.total,
        },
      });

      // Artificial delay to allow frontend to show holding screen
      const assessmentCreationDelayMs = parseInt(process.env.ASSESSMENT_CREATION_DELAY_MS ?? '0', 10);
      if (assessmentCreationDelayMs > 0) {
        this.logger.info('Delaying assessment creation', { delayMs: assessmentCreationDelayMs });
        await new Promise(resolve => setTimeout(resolve, assessmentCreationDelayMs));
      }

      // Create Assessment aggregate
      const assessment = Assessment.create(connection.customerId, connection.id);

      // Set customer billing information
      assessment.setBillingInfo(
        customer.monthlyBill ?? 0,
        customer.arrears ?? null
      );

      // Enrich with bank data
      assessment.enrichWithBankData(income.total, expenses.total, {
        incomeBreakdown: JSON.stringify(income),
        expenseBreakdown: JSON.stringify(expenses),
        expensesByCategory: JSON.stringify(expenseData),
        incomeHistory: JSON.stringify(incomeData),
        incomeSources: JSON.stringify(income),
        factors: null,
        paymentPlans: null,
      });

      // Mark as ready for processing (raises AssessmentReadyForProcessingEvent)
      assessment.markReadyForProcessing();

      // Save assessment with raised event
      const saveResult = await this.assessmentRepository.save(assessment);
      if (saveResult.isFail) {
        return Result.fail(saveResult.getError() || new Error('Failed to save assessment'));
      }

      const savedAssessment = saveResult.getOrThrow();

      // Mark connection as data retrieved
      connection.markDataRetrieved();
      const updateResult = await this.repository.update(connection);
      if (updateResult.isFail) {
        return Result.fail(
          updateResult.getError() || new Error('Failed to update bank connection')
        );
      }

      // Get domain events from the aggregate and publish them
      const events = assessment.getDomainEvents();
      for (const event of events) {
        if (event.getEventName() === 'AssessmentReadyForProcessing') {
          await this.eventHandler.handle(event as AssessmentReadyForProcessingEvent);
        }
      }

      this.logger.info('OAuth callback handled and assessment created with event published', {
        connectionId: connection.id,
        customerId: connection.customerId,
        assessmentId: savedAssessment.getId(),
        monthlyIncome: income.total,
        monthlyExpenses: expenses.total,
      });

      return Result.ok({
        connectionId: connection.id,
        totalExpenses: expenses.total,
        totalIncome: income.total,
        assessmentId: savedAssessment.getId(),
        incomeBreakdown: income,
        expenseBreakdown: expenses,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('OAuth callback failed', { error: message });
      return Result.fail(new Error(`OAuth callback failed: ${message}`));
    }
  }
}
