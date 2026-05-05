import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import type { IAssessmentRepository } from '../../domain/entities';
import type { AssessmentData } from '../../../shared/types/referenceData.types';
import type { ApplicationError } from '../../../../core/domain/errors';
import {
  AssessmentRepositoryQueryError,
  GetAssessmentQueryExecutionError,
} from '../errors/GetAssessmentQuery.errors';

export class GetAssessmentQuery {
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private logger: ILogger
  ) {}

  async execute(input: { customerId: string }): Promise<Result<AssessmentData | null, ApplicationError>> {
    try {
      const { customerId } = input;

      const assessmentResult = await this.assessmentRepository.findLatestByCustomerId(customerId);

      if (assessmentResult.isFail) {
        const repositoryError = assessmentResult.getError();
        this.logger.error('Failed to fetch referenceData', {
          customerId,
          error: repositoryError,
        });
        return Result.fail(new AssessmentRepositoryQueryError(customerId, repositoryError));
      }

      const assessment = assessmentResult.getOrElse(null);

      if (!assessment) {
        return Result.ok<AssessmentData | null>(null) as Result<AssessmentData | null, ApplicationError>;
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

      return Result.ok<AssessmentData | null>(assessmentData) as Result<
        AssessmentData | null,
        ApplicationError
      >;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('GetAssessment query failed', {
        error: message,
      });
      return Result.fail(new GetAssessmentQueryExecutionError(error));
    }
  }
}
