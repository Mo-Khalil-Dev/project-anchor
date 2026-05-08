import { API } from '@/api/endpoints';
import { httpService } from '@/api/httpService';
import { unwrap } from '@/api/unwrap';
import { ApiResponse } from '@/types';

export interface InitiateDirectDebitInput {
  accountHolderName: string;
  redirectUri: string;
  exitUri: string;
}

export interface InitiateDirectDebitResponse {
  authorizationUrl: string;
  billingRequestId: string;
  flowId: string;
}

export const paymentService = {
  /**
   * Kick off the GoCardless billing request flow.
   * Returns a hosted authorizationUrl — the frontend should redirect to it.
   *
   * POST /api/payments/initiate-direct-debit
   */
  initiateDirectDebit: (input: InitiateDirectDebitInput): Promise<InitiateDirectDebitResponse> =>
    httpService
      .post<ApiResponse<InitiateDirectDebitResponse>>(API.payments.initiateDirectDebit, input)
      .then(unwrap),
};
