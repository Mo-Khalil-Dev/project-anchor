import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import type { IAssessmentRepository } from '@/features/assessment/domain/entities';
import type { ApplicationError } from '../../../../core/domain/errors';
import type {
  CompleteAssessmentInput,
  CompleteAssessmentOutput,
} from './CompleteAssessmentUseCase.dto';
import {
  AssessmentNotFoundError,
  CompleteAssessmentExecutionError,
} from '@/features/assessment/application/errors/CompleteAssessmentUseCase.errors';
import { AssessmentCompletedEvent } from '@/features/assessment/domain/events';

export class CompleteAssessmentUseCase {
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private logger: ILogger
  ) {}

  async execute(
    input: CompleteAssessmentInput
  ): Promise<Result<CompleteAssessmentOutput, ApplicationError>> {
    try {
      const { assessmentId } = input;

      // Load assessment from repository
      const assessmentResult = await this.assessmentRepository.findById(assessmentId);

      if (assessmentResult.isFail) {
        const repositoryError = assessmentResult.getError();
        this.logger.error('Failed to fetch assessment for completion', {
          assessmentId,
          error: repositoryError,
        });
        return Result.fail(new AssessmentNotFoundError(assessmentId, repositoryError));
      }

      const assessment = assessmentResult.getOrElse(null);

      if (!assessment) {
        this.logger.warn('Assessment not found', { assessmentId });
        return Result.fail(new AssessmentNotFoundError(assessmentId));
      }

      // Call mutation method (records AssessmentCompletedEvent internally)
      assessment.markAsCompleted();

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

      // Persist changes
      const updateResult = await this.assessmentRepository.update(assessment);

      if (updateResult.isFail) {
        const persistError = updateResult.getError();
        this.logger.error('Failed to save completed assessment', {
          assessmentId,
          error: persistError,
        });
        return Result.fail(
          new CompleteAssessmentExecutionError('Failed to persist assessment', persistError)
        ) as Result<CompleteAssessmentOutput, ApplicationError>;
      }

      // Return output DTO
      const output: CompleteAssessmentOutput = {
        assessmentId: assessment.getId(),
        status: 'COMPLETED',
        hardshipLevel: assessment.getHardshipLevel(),
        disposableIncome: assessment.calculateDisposableIncome(),
      };
      return Result.ok(output) as Result<CompleteAssessmentOutput, ApplicationError>;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('CompleteAssessment use case failed', { error: message });
      return Result.fail(
        new CompleteAssessmentExecutionError('Unexpected error during completion', error)
      );
    }
  }
}
