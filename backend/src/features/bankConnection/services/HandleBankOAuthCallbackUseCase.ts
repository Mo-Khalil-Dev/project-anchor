import { PrismaClient } from '@prisma/client';
import { Result } from '../../shared/result';
import type { IBankConnectionRepository } from '../types/bankConnection.types';
import type { ILogger } from '../../shared/logging';
import type { IBankDataProvider } from './IBankDataProvider';
import type { IncomeBreakdown, ExpenseBreakdown } from './BankDataExtractionService';
import type { IEventHandler } from '../../../core/application/services/IEventHandler';
import type { AssessmentReadyForProcessingEvent } from '@/features/referenceData/domain/events/AssessmentReadyForProcessingEvent';
import { Assessment } from '@/features/referenceData/domain/entities';
import type { IAssessmentRepository } from '@/features/referenceData/domain/entities';

export class HandleBankOAuthCallbackUseCase {
  constructor(
    private repository: IBankConnectionRepository,
    private assessmentRepository: IAssessmentRepository,
    private bankDataProvider: IBankDataProvider,
    private prisma: PrismaClient,
    private logger: ILogger,
    private eventHandler: IEventHandler<AssessmentReadyForProcessingEvent>,
  ) {}

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

      const financialDataResult = await this.bankDataProvider.fetchFinancialData(code);
      if (financialDataResult.isFail) {
        return Result.fail(financialDataResult.getError() || new Error('Failed to fetch bank financial data'));
      }

      const { income, expenses, rawIncomeData, rawExpenseData } = financialDataResult.getOrThrow();

      await this.prisma.bankReports.upsert({
        where: { bankConnectionId: connection.id },
        update: {
          incomeJson: JSON.stringify(rawIncomeData),
          expensesJson: JSON.stringify(rawExpenseData),
          totalMonthlyIncome: income.total,
          totalMonthlyExpenses: expenses.total,
          createdAt: new Date(),
        },
        create: {
          bankConnectionId: connection.id,
          incomeJson: JSON.stringify(rawIncomeData),
          expensesJson: JSON.stringify(rawExpenseData),
          totalMonthlyIncome: income.total,
          totalMonthlyExpenses: expenses.total,
        },
      });

      const assessmentCreationDelayMs = parseInt(process.env.ASSESSMENT_CREATION_DELAY_MS ?? '0', 10);
      if (assessmentCreationDelayMs > 0) {
        this.logger.info('Delaying assessment creation', { delayMs: assessmentCreationDelayMs });
        await new Promise(resolve => setTimeout(resolve, assessmentCreationDelayMs));
      }

      const assessment = Assessment.create(connection.customerId, connection.id);
      assessment.setBillingInfo(customer.monthlyBill ?? 0, customer.arrears ?? null);
      assessment.enrichWithBankData(income.total, expenses.total, {
        incomeBreakdown: JSON.stringify(income),
        expenseBreakdown: JSON.stringify(expenses),
        expensesByCategory: JSON.stringify(rawExpenseData),
        incomeHistory: JSON.stringify(rawIncomeData),
        incomeSources: JSON.stringify(income),
        factors: null,
        paymentPlans: null,
      });
      assessment.markReadyForProcessing();

      const saveResult = await this.assessmentRepository.save(assessment);
      if (saveResult.isFail) {
        return Result.fail(saveResult.getError() || new Error('Failed to save assessment'));
      }

      const savedAssessment = saveResult.getOrThrow();

      connection.markDataRetrieved();
      const updateResult = await this.repository.update(connection);
      if (updateResult.isFail) {
        return Result.fail(updateResult.getError() || new Error('Failed to update bank connection'));
      }

      const events = assessment.getDomainEvents();
      for (const event of events) {
        if (event.getEventName() === 'AssessmentReadyForProcessing') {
          await this.eventHandler.handle(event as AssessmentReadyForProcessingEvent);
        }
      }

      this.logger.info('OAuth callback handled and assessment created', {
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
