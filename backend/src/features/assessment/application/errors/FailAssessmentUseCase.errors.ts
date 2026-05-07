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

export class FailAssessmentExecutionError extends ApplicationError {
  constructor(message: string, cause?: unknown) {
    super('FAIL_ASSESSMENT_FAILED', `Failed to mark assessment as failed: ${message}`, 500, {
      cause: cause instanceof Error ? cause.message : String(cause),
    });
    this.name = 'FailAssessmentExecutionError';
    Object.setPrototypeOf(this, FailAssessmentExecutionError.prototype);
  }
}
