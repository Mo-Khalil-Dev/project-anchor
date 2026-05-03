import { API } from '@/api/endpoints';
import { httpService } from '@/api/httpService';
import { unwrap } from '@/api/unwrap';
import { ApiResponse } from '@/types';

export type PlanType = 'Conservative' | 'Balanced' | 'Aggressive';

export interface SelectPlanInput {
  planType: PlanType;
}

export interface SelectPlanResponse {
  assessmentId: string;
  selectedPlan: PlanType;
}

export const paymentService = {
  /**
   * Persist the customer's chosen payment plan on their latest assessment.
   * Called when the user accepts the T&C.
   *
   * POST /api/payments/select-plan
   */
  selectPlan: (input: SelectPlanInput): Promise<SelectPlanResponse> =>
    httpService
      .post<ApiResponse<SelectPlanResponse>>(API.payments.selectPlan, input)
      .then(unwrap),
};
