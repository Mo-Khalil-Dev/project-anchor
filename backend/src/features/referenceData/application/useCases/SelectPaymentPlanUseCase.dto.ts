export interface SelectPaymentPlanInput {
  assessmentId: string;
  planType: 'Conservative' | 'Balanced' | 'Aggressive';
}

export interface SelectPaymentPlanOutput {
  assessmentId: string;
  selectedPlan: 'Conservative' | 'Balanced' | 'Aggressive';
  selectedAt: string;
}
