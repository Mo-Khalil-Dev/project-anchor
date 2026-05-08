import type { PlanType } from '@/features/assessment/domain/entities';

export interface SelectPlanInput {
  userId: string;
  planType: PlanType;
}

export interface SelectPlanOutput {
  assessmentId: string;
  selectedPlan: PlanType;
}
