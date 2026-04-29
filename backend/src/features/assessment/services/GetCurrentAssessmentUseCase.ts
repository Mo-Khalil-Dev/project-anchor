import { Result } from '../../shared/result';
import type { ILogger } from '../../shared/logging';
import type { IAssessmentRepository } from '../types/assessment.types';
import { Assessment } from '../types/assessment.types';

export interface GetCurrentAssessmentInput {
  customerId: string;
}

/**
 * GetCurrentAssessmentUseCase
 *
 * Fetches the latest assessment for an authenticated customer.
 * Used by the Reference Data endpoint (`GET /api/me/assessment`).
 *
 * Returns the full assessment with all breakdown data:
 * - expensesByCategory
 * - incomeHistory
 * - incomeSources
 * - factors
 * - paymentPlans
 */
export class GetCurrentAssessmentUseCase {
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private logger: ILogger,
  ) {}

  async execute(
    input: GetCurrentAssessmentInput,
  ): Promise<Result<Assessment | null, Error>> {
    try {
      const { customerId } = input;

      if (!customerId) {
        return Result.fail(new Error('Customer ID is required'));
      }

      const result = await this.assessmentRepository.findLatestByCustomerId(customerId);

      if (result.isFail) {
        this.logger.error('Failed to fetch current assessment', {
          customerId,
          error: result.getError()?.message,
        });
        return Result.fail(new Error('Failed to fetch assessment'));
      }

      const assessment = result.getOrElse(null);

      if (assessment) {
        this.logger.info('Current assessment retrieved', {
          customerId,
          assessmentId: assessment.getId(),
          hardshipLevel: assessment.getHardshipLevel(),
        });
      }

      return Result.ok(assessment);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('GetCurrentAssessment use case error', {
        error: message,
        customerId: input.customerId,
      });
      return Result.fail(new Error(`Failed to fetch assessment: ${message}`));
    }
  }
}
