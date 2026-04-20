import { axiosInstance } from '@/api/client';
import { ApiResponse, BankConnectionData } from '@/types';

export interface InitiateBankResponse {
  authUrl: string;
  state: string;
}

export interface HandleBankCallbackResponse {
  connectionId: string;
  expenseData: BankConnectionData;
}

export async function initiateBank(): Promise<InitiateBankResponse> {
  const response = await axiosInstance.post<ApiResponse<InitiateBankResponse>>(
    '/bank-connections/initiate'
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to initiate bank connection');
  }
  return response.data.data;
}

export async function handleBankCallback(
  expenseCheckReportId: string
): Promise<HandleBankCallbackResponse> {
  const response = await axiosInstance.get<ApiResponse<HandleBankCallbackResponse>>(
    '/bank-connections/callback',
    {
      params: { expense_check_report_id: expenseCheckReportId },
    }
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to handle bank callback');
  }
  return response.data.data;
}
