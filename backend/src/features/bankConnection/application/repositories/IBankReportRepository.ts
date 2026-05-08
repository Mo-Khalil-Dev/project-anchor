import type { Result } from '@/features/shared/result';

export interface BankReportData {
  id: string;
  bankConnectionId: string;
  incomeJson: string;
  expensesJson: string;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  createdAt: Date;
  expiresAt: Date | null;
}

export interface IBankReportRepository {
  findByBankConnectionId(bankConnectionId: string): Promise<Result<BankReportData | null, Error>>;
  save(
    bankConnectionId: string,
    data: Omit<BankReportData, 'id' | 'createdAt'>
  ): Promise<Result<BankReportData, Error>>;
  findByBankConnectionIdOrThrow(bankConnectionId: string): Promise<BankReportData>;
}
