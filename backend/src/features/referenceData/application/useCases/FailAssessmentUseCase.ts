import { Result } from '../../../shared/result';
import type { ILogger } from '../../../shared/logging';
import type { IAssessmentRepository } from '../../domain/entities';
import type { ApplicationError } from '../../../../core/domain/errors';
import type { FailAssessmentInput, FailAssessmentOutput } from './FailAssessmentUseCase.dto';
import {
  AssessmentNotFoundError as FailAssessmentNotFoundError,
  FailAssessmentExecutionError,
} from '../errors/FailAssessmentUseCase.errors';
import { AssessmentFailedEvent } from '../../domain/events';

export class FailAssessmentUseCase {
  constructor(
    private assessmentRepository: IAssessmentRepository,
    private logger: ILogger,
  ) {}

  async execute(input: FailAssessmentInput): Promise<Result<FailAssessmentOutput, ApplicationError>> {
    try {
      const { assessmentId, reason, errorCode } = input;

      // Load assessment from repository
      const assessmentResult = await this.assessmentRepository.findById(assessmentId);

      if (assessmentResult.isFail) {
        const repositoryError = assessmentResult.getError();
        this.logger.error('Failed to fetch assessment for failure', {
          assessmentId,
          error: repositoryError,
        });
        return Result.fail(new FailAssessmentNotFoundError(assessmentId, repositoryError));
      }

      const assessment = assessmentResult.getOrElse(null);

      if (!assessment) {
        this.logger.warn('Assessment not found', { assessmentId });
        return Result.fail(new FailAssessmentNotFoundError(assessmentId));
      }

      // Call mutation method (records AssessmentFailedEvent internally)
      assessment.markAsFailed(reason, errorCode);

      // Handle domain events
      const domainEvents = assessment.getDomainEvents();
      for (const event of domainEvents) {
        if (event instanceof AssessmentFailedEvent) {
          this.logger.info('Assessment marked as failed', {
            assessmentId,
            reason: event.payload.reason,
            errorCode: event.payload.errorCode,
          });
        }
      }
      assessment.clearDomainEvents();

      // Persist changes
      const updateResult = await this.assessmentRepository.update(assessment);

      if (updateResult.isFail) {
        const persistError = updateResult.getError();
        this.logger.error('Failed to save failed assessment', {
          assessmentId,
          error: persistError,
        });
        return Result.fail(new FailAssessmentExecutionError('Failed to persist assessment', persistError)) as Result<
          FailAssessmentOutput,
          ApplicationError
        >;
      }

      // Return output DTO
      const output: FailAssessmentOutput = {
        assessmentId: assessment.getId(),
        status: 'FAILED',
        reason,
        errorCode,
      };
      return Result.ok(output) as Result<FailAssessmentOutput, ApplicationError>;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('FailAssessment use case failed', { error: message });
      return Result.fail(new FailAssessmentExecutionError('Unexpected error during failure marking', error));
    }
  }
}
