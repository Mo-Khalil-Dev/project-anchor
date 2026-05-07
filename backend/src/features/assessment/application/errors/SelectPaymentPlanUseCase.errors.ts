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

export class SelectPaymentPlanExecutionError extends ApplicationError {
  constructor(message: string, cause?: unknown) {
    super('SELECT_PAYMENT_PLAN_FAILED', `Failed to select payment plan: ${message}`, 500, {
      cause: cause instanceof Error ? cause.message : String(cause),
    });
    this.name = 'SelectPaymentPlanExecutionError';
    Object.setPrototypeOf(this, SelectPaymentPlanExecutionError.prototype);
  }
}

export class InvalidPlanTypeError extends ApplicationError {
  constructor(planType: string) {
    super(
      'INVALID_PLAN_TYPE',
      `Invalid plan type: ${planType}. Must be one of: Conservative, Balanced, Aggressive`,
      400,
      {
        planType,
      }
    );
    this.name = 'InvalidPlanTypeError';
    Object.setPrototypeOf(this, InvalidPlanTypeError.prototype);
  }
}
