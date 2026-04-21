import { axiosInstance } from '@/api/client';
import { ApiResponse } from '@/types';

export interface InitiateBankResponse {
  authUrl: string;
  state: string;
}

export interface IncomeBreakdown {
  salary: number;
  pension: number;
  benefits: number;
  cashDeposits: number;
  other: number;
  total: number;
}

export interface ExpenseBreakdown {
  housing: number;
  food: number;
  utilities: number;
  transport: number;
  other: number;
  total: number;
}

export interface HandleBankCallbackResponse {
  connectionId: string;
  totalExpenses: number;
  totalIncome: number;
  assessmentId: string;
  incomeBreakdown: IncomeBreakdown;
  expenseBreakdown: ExpenseBreakdown;
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
  expenseCheckId: string,
  state: string
): Promise<HandleBankCallbackResponse> {
  const response = await axiosInstance.get<ApiResponse<HandleBankCallbackResponse>>(
    '/bank-connections/callback',
    {
      params: {
        code: expenseCheckId,
        state: state,
      },
    }
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to handle bank callback');
  }
  return response.data.data;
}
