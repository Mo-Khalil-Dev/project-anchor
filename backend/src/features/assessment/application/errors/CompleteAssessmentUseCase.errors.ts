import { ApplicationError } from '../../../../core/domain/errors';

export class AssessmentNotFoundError extends ApplicationError {
  constructor(assessmentId: string, cause?: unknown) {
    super('ASSESSMENT_NOT_FOUND', `Assessment not found: ${assessmentId}`, 404, {
      assessmentId,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
    this.name = 'AssessmentNotFoundError';
    Object.setPrototypeOf(this, AssessmentNotFoundError.prototype);
  }
}

export class CompleteAssessmentExecutionError extends ApplicationError {
  constructor(message: string, cause?: unknown) {
    super('COMPLETE_ASSESSMENT_FAILED', `Failed to complete assessment: ${message}`, 500, {
      cause: cause instanceof Error ? cause.message : String(cause),
    });
    this.name = 'CompleteAssessmentExecutionError';
    Object.setPrototypeOf(this, CompleteAssessmentExecutionError.prototype);
  }
}
