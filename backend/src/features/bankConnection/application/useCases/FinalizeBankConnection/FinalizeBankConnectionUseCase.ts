import { PrismaClient } from '@prisma/client';
import { Result } from '@/features/shared/result';
import type { ILogger } from '@/features/shared/logging';
import type { IBankDataProvider } from '../../services/IBankDataProvider';
import type { IEventHandler } from '@/core/application/services/IEventHandler';
import type { AssessmentReadyForProcessingEvent } from '@/features/assessment/domain/events/AssessmentReadyForProcessingEvent';
import { Assessment } from '@/features/assessment/domain/entities';
import type { IAssessmentRepository } from '@/features/assessment/domain/entities';
import { IBankConnectionRepository } from '@/features/bankConnection/application/respositories/IBankConnectionRepository';
import type { FinalizeBankConnectionOutput } from './FinalizeBankConnection.dto';

export class FinalizeBankConnectionUseCase {
  constructor(
    private bankConnectionRepository: IBankConnectionRepository,
    private assessmentRepository: IAssessmentRepository,
    private bankDataProvider: IBankDataProvider,
    private prisma: PrismaClient,
    private logger: ILogger,
    private eventHandler: IEventHandler<AssessmentReadyForProcessingEvent>
  ) {}

  async execute(code: string, state: string): Promise<Result<FinalizeBankConnectionOutput, Error>> {
    try {
      const connResult = await this.bankConnectionRepository.findByOAuthState(state);
      if (connResult.isFail) {
        return Result.fail(connResult.getError() || new Error('Unknown error'));
      }

      const connection = connResult.getOrThrow();
      if (!connection) {
        return Result.fail(new Error('Invalid OAuth state token'));
      }

      const customer = await this.prisma.customer.findUnique({
        where: { id: connection.getCustomerId },
      });
      if (!customer) {
        return Result.fail(new Error('Customer not found'));
      }

      const financialDataResult = await this.bankDataProvider.fetchFinancialData(code);
      if (financialDataResult.isFail) {
        return Result.fail(
          financialDataResult.getError() || new Error('Failed to fetch bank financial data')
        );
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
      await this.delayAssessmentCreation();

      const assessment = Assessment.create(connection.getCustomerId, connection.id);
      assessment.assignBill(customer.monthlyBill ?? 0, customer.arrears ?? null);
      assessment.recordFinancialProfile(income.total, expenses.total, {
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
      const updateResult = await this.bankConnectionRepository.update(connection);
      if (updateResult.isFail) {
        return Result.fail(
          updateResult.getError() || new Error('Failed to update bank connection')
        );
      }

      const events = assessment.getDomainEvents();
      for (const event of events) {
        if (event.getEventName() === 'AssessmentReadyForProcessing') {
          await this.eventHandler.handle(event as AssessmentReadyForProcessingEvent);
        }
      }

      this.logger.info('Bank connection finalized and assessment created', {
        connectionId: connection.id,
        customerId: connection.getCustomerId,
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
      this.logger.error('Bank connection finalization failed', { error: message });
      return Result.fail(new Error(`Bank connection finalization failed: ${message}`));
    }
  }
  private async delayAssessmentCreation() {
    const assessmentCreationDelayMs = parseInt(process.env.ASSESSMENT_CREATION_DELAY_MS ?? '0', 10);
    if (assessmentCreationDelayMs > 0) {
      this.logger.info('Delaying assessment creation', { delayMs: assessmentCreationDelayMs });
      await new Promise((resolve) => setTimeout(resolve, assessmentCreationDelayMs));
    }
  }
}
