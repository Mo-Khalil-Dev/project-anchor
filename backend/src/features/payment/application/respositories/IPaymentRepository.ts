import type { Result } from '@/features/shared/result';
import type { MandateStatus } from '@/features/shared/types/mandate-status';

export type ScheduleStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface SaveMandateInput {
  customerId: string;
  gocardlessId: string;
  status: MandateStatus;
  accountHolderName: string;
  bankAccountNumber?: string | null;
  sortCode?: string | null;
  expiresAt?: Date | null;
}

export interface SavePaymentMethodInput {
  customerId: string;
  mandateId: string;
  type: 'direct_debit';
  isDefault: boolean;
}

export interface SavePaymentScheduleInput {
  mandateId: string;
  assessmentId: string;
  gocardlessId: string;
  planType: 'Conservative' | 'Balanced' | 'Aggressive';
  monthlyAmount: number;
  totalAmount: number;
  dayOfMonth: number;
  status: ScheduleStatus;
  firstPaymentDate: Date;
  finalPaymentDate: Date;
}

export interface IPaymentRepository {
  /** Persist a Mandate row, returning the new mandate's ID */
  saveMandate(input: SaveMandateInput): Promise<Result<{ id: string }, Error>>;

  /** Persist a PaymentMethod row linking customer ↔ mandate */
  savePaymentMethod(input: SavePaymentMethodInput): Promise<Result<void, Error>>;

  /** Persist a PaymentSchedule row tied to a mandate + referenceData */
  savePaymentSchedule(input: SavePaymentScheduleInput): Promise<Result<void, Error>>;

  /** Find existing payment schedule by referenceData ID — used for idempotency */
  findPaymentScheduleByAssessmentId(
    assessmentId: string
  ): Promise<Result<{ id: string; gocardlessId: string } | null, Error>>;
}
