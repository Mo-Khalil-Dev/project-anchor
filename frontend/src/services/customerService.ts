import { API } from '@/api/endpoints';
import { httpService } from '@/api/httpService';
import { unwrap } from '@/api/unwrap';
import { ApiResponse } from '@/types';

export interface LinkUserToCustomerInput {
  utilityType: 'Electricity' | 'Gas' | 'Water';
  postcode: string;
  accountReference: string;
}

export interface LinkUserToCustomerResponse {
  id: string;
  email: string;
  utilityType: string | null;
  postcode: string | null;
  utilityAccountNo: string | null;
  createdAt: string;
}

export const customerService = {
  /**
   * Link authenticated user to a customer by submitting account setup details
   *
   * POST /api/customer/setup
   * Requires: Authorization header with Bearer token
   */
  linkUserToCustomer: (input: LinkUserToCustomerInput): Promise<LinkUserToCustomerResponse> =>
    httpService
      .post<ApiResponse<LinkUserToCustomerResponse>>(API.customer.setup, input)
      .then(unwrap),
};
