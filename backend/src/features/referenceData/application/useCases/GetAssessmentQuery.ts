import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import type { IAssessmentRepository } from '../../domain/entities';
import type { AssessmentData } from '../../../shared/types/referenceData.types';

export class GetAssessmentQuery {
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private logger: ILogger
  ) {}

  async execute(input: { customerId: string }): Promise<Result<AssessmentData | null, Error>> {
    try {
      const { customerId } = input;

      const assessmentResult = await this.assessmentRepository.findLatestByCustomerId(customerId);

      if (assessmentResult.isFail) {
        this.logger.error('Failed to fetch referenceData', {
          customerId,
          error: assessmentResult.getError(),
        });
        return Result.fail(new Error('Failed to fetch referenceData data'));
      }

      const assessment = assessmentResult.getOrElse(null);

      if (!assessment) {
        return Result.ok(null);
      }

      // Parse JSON fields
      let expensesByCategory: Record<string, number> = {};
      let incomeSources: any[] = [];
      let incomeHistory: any[] = [];
      let factors: any[] = [];
      let paymentPlans: any[] = [];

      try {
        const expensesCategoryJson = assessment.getExpensesByCategory();
        if (expensesCategoryJson) {
          expensesByCategory = JSON.parse(expensesCategoryJson);
        }
      } catch (e) {
        this.logger.warn('Failed to parse expensesByCategory', { customerId });
      }

      try {
        const incomeSourcesJson = assessment.getIncomeSources();
        if (incomeSourcesJson) {
          incomeSources = JSON.parse(incomeSourcesJson);
        }
      } catch (e) {
        this.logger.warn('Failed to parse incomeSources', { customerId });
      }

      try {
        const incomeHistoryJson = assessment.getIncomeHistory();
        if (incomeHistoryJson) {
          incomeHistory = JSON.parse(incomeHistoryJson);
        }
      } catch (e) {
        this.logger.warn('Failed to parse incomeHistory', { customerId });
      }

      try {
        const factorsJson = assessment.getFactors();
        if (factorsJson) {
          factors = JSON.parse(factorsJson);
        }
      } catch (e) {
        this.logger.warn('Failed to parse factors', { customerId });
      }

      try {
        const suggestedPaymentPlansJson = assessment.getPaymentPlans();
        if (suggestedPaymentPlansJson) {
          paymentPlans = JSON.parse(suggestedPaymentPlansJson);
        }
      } catch (e) {
        this.logger.warn('Failed to parse suggestedPaymentPlans', { customerId });
      }

      const monthlyIncome = assessment.getMonthlyIncome();
      const monthlyExpenses = assessment.getMonthlyExpenses();

      const assessmentData: AssessmentData = {
        id: assessment.getId(),
        status:
          assessment.getStatus() === 'COMPLETED'
            ? 'COMPLETED'
            : assessment.getStatus() === 'PENDING'
              ? 'PENDING'
              : 'IN_PROGRESS',
        hardshipLevel: assessment.getHardshipLevel(),
        disposableIncome: assessment.calculateDisposableIncome(),
        monthlyBill: assessment.getMonthlyBill(),
        billRatio: assessment.calculateBillRatio(),
        monthlyIncome,
        monthlyExpenses,
        expensesByCategory,
        incomeSources,
        incomeHistory,
        factors,
        paymentPlans,
        createdAt: assessment.getCreatedAt().toISOString(),
      };

      return Result.ok(assessmentData);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('GetAssessment query failed', {
        error: message,
      });
      return Result.fail(new Error(`Failed to get assessment: ${message}`));
    }
  }
}
