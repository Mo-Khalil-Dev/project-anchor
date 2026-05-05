import type { PlanType } from '@/features/referenceData/domain/entities';

export type { PlanType };

export interface SelectPlanInput {
  userId: string;
  planType: PlanType;
}

export interface SelectPlanOutput {
  assessmentId: string;
  selectedPlan: PlanType;
}

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
