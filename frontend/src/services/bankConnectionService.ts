import { API } from '@/api/endpoints';
import { httpService } from '@/api/httpService';
import { ApiResponse } from '@/types';

export interface InitiateBankResponse {
  authUrl: string;
  state: string;
}

export interface HandleBankCallbackResponse {
  connectionId: string;
  totalExpenses: number;
  totalIncome: number;
  assessmentId: string;
  incomeBreakdown: {
    salary: number; pension: number; benefits: number; cashDeposits: number; other: number; total: number;
  };
  expenseBreakdown: {
    housing: number; food: number; utilities: number; transport: number; other: number; total: number;
  };
}

function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || !res.data) throw new Error(res.error || 'Request failed');
  return res.data;
}

export const bankConnectionService = {
  initiate: (): Promise<InitiateBankResponse> =>
    httpService.post<ApiResponse<InitiateBankResponse>>(API.bankConnections.initiate).then(unwrap),

  callback: (code: string, state: string): Promise<HandleBankCallbackResponse> =>
    httpService.get<ApiResponse<HandleBankCallbackResponse>>(API.bankConnections.callback, { params: { code, state } }).then(unwrap),
};
