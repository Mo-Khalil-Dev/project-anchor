import { ApplicationError } from './applicationError';

/**
 * Validation error for request validation failures
 *
 * Use for HTTP request validation errors (bad input from client)
 * Automatically sets HTTP status to 400 (Bad Request)
 */
export class ValidationError extends ApplicationError {
  constructor(
    message: string,
    details?: Record<string, string | string[]>
  ) {
    super(
      'VALIDATION_ERROR',
      message,
      400,
      details
    );
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Create from Zod parsing error
   */
  static fromZod(error: any): ValidationError {
    const details: Record<string, string[]> = {};

    if (error.issues) {
      for (const issue of error.issues) {
        const path = issue.path.join('.');
        if (!details[path]) {
          details[path] = [];
        }
        details[path].push(issue.message);
      }
    }

    return new ValidationError(
      'Request validation failed',
      details
    );
  }
}
