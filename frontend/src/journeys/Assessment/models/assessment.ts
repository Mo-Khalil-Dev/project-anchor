import { IncomeBreakdown } from './incomeBreakdown';
import { ExpenseBreakdown } from './expenseBreakdown';

export interface Assessment {
    id: string;
    customerId: string;
    monthlyIncome: number;
    monthlyExpenses: number;
    disposableIncome: number;
    monthlyBill: number;
    billRatio: number;
    hardshipLevel: 'SEVERE' | 'MODERATE' | 'LOW' | 'NONE';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    arrears?: number | null;
    incomeBreakdown?: IncomeBreakdown | null;
    expenseBreakdown?: ExpenseBreakdown | null;
    calculatedAt: string;
}