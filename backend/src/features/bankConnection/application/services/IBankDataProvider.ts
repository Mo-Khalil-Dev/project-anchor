import type { Result } from '../../../shared/result';
import type {
  IncomeBreakdown,
  ExpenseBreakdown,
} from '@/features/bankConnection/infrastructure/services/Tink/TinkResponseParser';

export interface BankFinancialData {
  income: IncomeBreakdown;
  expenses: ExpenseBreakdown;
  rawIncomeData: unknown;
  rawExpenseData: unknown;
}

export interface IBankDataProvider {
  fetchFinancialData(code: string): Promise<Result<BankFinancialData, Error>>;
}
