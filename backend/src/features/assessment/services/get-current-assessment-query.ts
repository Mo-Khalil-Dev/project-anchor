import { Result } from '../../shared/result';
import type { ILogger } from '../../shared/logging';
import type { IAssessmentRepository } from '../types/assessment.types';
import { Assessment } from '../types/assessment.types';
import type { ICustomerRepository } from '../../customer/types/customer.types';
import { Usecase } from '@/core/domain/common/useCase';
import { ApplicationError } from '@/core/domain/errors';
import { DomainError } from '@/core/domain/errors/domainError';
import { UserIdMissingError } from '@/features/assessment/application/errors/UserNotFoundError';

export interface GetCurrentAssessmentInput {
  userId: string;
}

/**
 * GetCurrentAssessmentUseCase
 *
 * Fetches the latest assessment for the authenticated user.
 *
 * Flow:
 *   1. Receive userId from the auth token
 *   2. Look up the linked customerId via the User → Customer relation
 *   3. Fetch the latest assessment for that customerId
 *
 * Used by: GET /api/me/assessment (Reference Data endpoint)
 */
export class GetCurrentAssessmentUseCase implements Usecase<GetCurrentAssessmentInput, Assessment>{
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private customerRepository: ICustomerRepository,
    private logger: ILogger,
  ) {}

  async execute(
    input: GetCurrentAssessmentInput,
  ): Promise<Result<Assessment | null, ApplicationError|DomainError|Error>> {
    try {
      const { userId } = input;
                                                                   
      if (!userId) {
        return Result.fail(new UserIdMissingError());
      }

      // Step 1: Resolve userId → customerId via Users table
      const customerIdResult = await this.customerRepository.findCustomerIdByUserId(userId);
      if (customerIdResult.isFail) {
        this.logger.error('Failed to resolve customerId from userId', {
          userId,
          error: customerIdResult.getError()?.message,
        });
        return Result.fail(new Error('Failed to resolve customer'));
      }

      const customerId = customerIdResult.getOrElse(null);
      if (!customerId) {
        // User exists but is not linked to a customer record yet
        this.logger.info('No customer linked to user', { userId });
        return Result.ok(null);
      }

      // Step 2: Fetch the latest assessment for that customer
      const assessmentResult = await this.assessmentRepository.findLatestByCustomerId(customerId);
      if (assessmentResult.isFail) {
        this.logger.error('Failed to fetch current assessment', {
          userId,
          customerId,
          error: assessmentResult.getError()?.message,
        });
        return Result.fail(new Error('Failed to fetch assessment'));
      }

      const assessment = assessmentResult.getOrElse(null);

      if (assessment) {
        this.logger.info('Current assessment retrieved', {
          userId,
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
        userId: input.userId,
      });
      return Result.fail(new Error(`Failed to fetch assessment: ${message}`));
    }
  }
}
