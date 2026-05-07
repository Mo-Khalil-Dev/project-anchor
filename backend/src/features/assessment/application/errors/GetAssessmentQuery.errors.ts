import { ApplicationError } from '../../../../core/domain/errors';

export class AssessmentRepositoryQueryError extends ApplicationError {
  constructor(customerId: string, cause?: unknown) {
    super('ASSESSMENT_REPOSITORY_QUERY_FAILED', 'Failed to fetch assessment data', 500, {
      customerId,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
    this.name = 'AssessmentRepositoryQueryError';
    Object.setPrototypeOf(this, AssessmentRepositoryQueryError.prototype);
  }
}

export class GetAssessmentQueryExecutionError extends ApplicationError {
  constructor(cause: unknown) {
    super(
      'GET_ASSESSMENT_QUERY_EXECUTION_FAILED',
      `Failed to get assessment: ${cause instanceof Error ? cause.message : String(cause)}`,
      500,
      {
        cause: cause instanceof Error ? cause.message : String(cause),
      }
    );
    this.name = 'GetAssessmentQueryExecutionError';
    Object.setPrototypeOf(this, GetAssessmentQueryExecutionError.prototype);
  }
}
