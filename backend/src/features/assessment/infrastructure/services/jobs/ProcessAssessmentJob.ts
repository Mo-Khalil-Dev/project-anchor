import { Result } from '@/features/shared/result';
import { TinkResponseParser } from '@/features/bankConnection/infrastructure/services/Tink/TinkResponseParser';
import type { IAssessmentRepository } from '@/features/assessment/domain/entities';
import { Assessment } from '@/features/assessment/domain/entities';
import type { ILogger } from '@/features/shared/logging';
import { PaymentPlanCalculationService } from '@/features/assessment/application/services/paymentPlanCalculations/PaymentPlanCalculationService';
import type { IBackgroundJob } from '@/core/application/services/IBackgroundJob';
import { FailAssessmentUseCase } from '@/features/assessment/application/useCases/FailAssessmentUseCase';
import type { IBankReportRepository } from '@/features/bankConnection/application/repositories/IBankReportRepository';
import { AssessmentCompletedEvent } from '@/features/assessment/domain/events';

export class ProcessAssessmentJob implements IBackgroundJob<string> {
  private paymentPlanService = new PaymentPlanCalculationService();

  constructor(
    private assessmentRepository: IAssessmentRepository,
    private bankReportRepository: IBankReportRepository,
    private logger: ILogger,
    private failAssessmentUseCase: FailAssessmentUseCase
  ) {}

  async execute(assessmentId: string): Promise<Result<void, Error>> {
    try {
      const assessment = await this.assessmentRepository.findByIdOrThrow(assessmentId);
      const bankConnectionId = this.validateBankConnectionExists(assessment);
      const bankReport =
        await this.bankReportRepository.findByBankConnectionIdOrThrow(bankConnectionId);
      const { incomeData, expenseData } = this.parseBankReportData(bankReport);
      const income = this.extractIncomeOrThrow(incomeData);
      const expenses = this.extractExpensesOrThrow(expenseData);

      // Build breakdown JSON fields for the Reference Data endpoint
      const expensesByCategory: Record<string, number> = {
        Housing: expenses.housing ?? 0,
        'Food & groceries': expenses.food ?? 0,
        Transport: expenses.transport ?? 0,
        Utilities: expenses.utilities ?? 0,
        Other: expenses.other ?? 0,
      };

      const incomeSources = [
        income.salary && { type: 'Salary (regular)', amount: income.salary, frequency: 'Monthly' },
        income.benefits && { type: 'Benefits', amount: income.benefits, frequency: 'Monthly' },
        income.pension && { type: 'Pension', amount: income.pension, frequency: 'Monthly' },
        income.other && { type: 'Other income', amount: income.other, frequency: 'Monthly' },
      ].filter(Boolean);

      // Update assessment with enriched bank data
      assessment.recordFinancialProfile(income.total, expenses.total, {
        incomeBreakdown: JSON.stringify(income),
        expenseBreakdown: JSON.stringify(expenses),
        expensesByCategory: JSON.stringify(expensesByCategory),
        incomeHistory: assessment.getIncomeHistory(),
        incomeSources: JSON.stringify(incomeSources),
        factors: assessment.getFactors(),
      });

      // Calculate payment plans with bill consideration
      const paymentPlans = this.paymentPlanService.calculatePlans(
        assessment.calculateDisposableIncome(),
        assessment.getArrears(),
        assessment.getMonthlyBill()
      );
      assessment.recordPaymentPlans(paymentPlans);
      assessment.markAsCompleted();

      const enrichmentResult = await this.assessmentRepository.update(assessment);
      if (enrichmentResult.isFail) {
        return Result.fail(enrichmentResult.getError() || new Error('Failed to enrich assessment'));
      }
      // Handle domain events
      const domainEvents = assessment.getDomainEvents();
      for (const event of domainEvents) {
        if (event instanceof AssessmentCompletedEvent) {
          this.logger.info('Assessment completed', {
            assessmentId,
            hardshipLevel: event.payload.hardshipLevel,
            disposableIncome: event.payload.disposableIncome,
          });
        }
      }
      assessment.clearDomainEvents();

      this.logger.info('Assessment processed successfully', {
        assessmentId,
        monthlyIncome: income.total,
        monthlyExpenses: expenses.total,
        disposableIncome: assessment.calculateDisposableIncome(),
        paymentPlanCount: paymentPlans.length,
      });

      return Result.ok(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('Assessment processing failed', { assessmentId, error: message });
      await this.markAssessmentFailed(assessmentId, message);
      return Result.fail(new Error(`Assessment processing failed: ${message}`));
    }
  }

  private validateBankConnectionExists(assessment: Assessment): string {
    const bankConnectionId = assessment.getBankConnectionId();
    if (!bankConnectionId) {
      throw new Error('Assessment missing bank connection');
    }
    return bankConnectionId;
  }

  private parseBankReportData(bankReport: any): { incomeData: any; expenseData: any } {
    try {
      return {
        incomeData: JSON.parse(bankReport.incomeJson),
        expenseData: JSON.parse(bankReport.expensesJson),
      };
    } catch (error) {
      throw new Error('Failed to parse bank report JSON');
    }
  }

  private extractIncomeOrThrow(incomeData: any) {
    const result = TinkResponseParser.extractIncome(incomeData);
    if (result.isFail) {
      throw result.getError() || new Error('Failed to extract income');
    }
    return result.getOrThrow();
  }

  private extractExpensesOrThrow(expenseData: any) {
    const result = TinkResponseParser.extractExpenses(expenseData);
    if (result.isFail) {
      throw result.getError() || new Error('Failed to extract expenses');
    }
    return result.getOrThrow();
  }

  private async markAssessmentFailed(assessmentId: string, reason: string): Promise<void> {
    try {
      const failResult = await this.failAssessmentUseCase.execute({
        assessmentId,
        reason,
        errorCode: 'BANK_DATA_PROCESSING_FAILED',
      });

      if (failResult.isFail) {
        this.logger.error('Failed to mark assessment as failed', {
          assessmentId,
          error: failResult.getError()?.message,
        });
      }
    } catch (error) {
      this.logger.error('Error marking assessment as failed', { assessmentId, error });
    }
  }
}
