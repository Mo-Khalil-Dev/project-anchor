import type { PlanType } from '@/features/assessment/domain/entities';
export type { PlanType };

// Re-export from assessment for backward compatibility
export type { SelectPlanInput, SelectPlanOutput } from '@/features/assessment/application/dtos/SelectPlanUseCase.dto';

export interface InitiateDirectDebitInput {
  userId: string;
  accountHolderName: string;
  sortCode: string;
  accountNumber: string;
  dayOfMonth: number;
}

export interface InitiateDirectDebitOutput {
  redirectUrl: string;
  billingRequestId: string;
}
