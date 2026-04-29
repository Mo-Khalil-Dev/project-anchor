/**
 * Base class for all domain-level errors.
 *
 * Domain errors represent business rule violations and invalid state transitions.
 * They are different from infrastructure errors (DB, network) and are expected
 * to be handled gracefully with user-friendly messages.
 */
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
