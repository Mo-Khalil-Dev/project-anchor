export interface FinalizeBankConnectionInput {
  code: string;
  state: string;
}

export interface FinalizeBankConnectionOutput {
  connectionId: string;
  totalExpenses: number;
  totalIncome: number;
  assessmentId: string;
  incomeBreakdown: IncomeBreakdown;
  expenseBreakdown: ExpenseBreakdown;
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
