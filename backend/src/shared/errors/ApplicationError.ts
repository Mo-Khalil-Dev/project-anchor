/**
 * Base class for application-level errors
 *
 * Represents errors that occur in application logic (use cases, services)
 * as opposed to domain errors or infrastructure errors.
 *
 * Use ApplicationError for:
 * - Repository errors (not found, connection failed)
 * - Service errors (external API failures)
 * - Use case errors (business logic failures)
 */
export class ApplicationError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApplicationError';
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}
