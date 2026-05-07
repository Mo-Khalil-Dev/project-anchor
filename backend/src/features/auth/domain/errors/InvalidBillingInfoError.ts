import { DomainError } from '@/core/domain/errors';

export class InvalidBillingInfoError extends DomainError {
  constructor(details?: Record<string, any>) {
    super(
      'CUSTOMER_INVALID_BILLING_INFO',
      'Monthly bill and arrears must be non-negative numbers',
      details
    );
  }
}
