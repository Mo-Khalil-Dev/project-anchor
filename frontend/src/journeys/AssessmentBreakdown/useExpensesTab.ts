import type { AssessmentDetailedDTO } from '@/types';
import { UK_EXPENSE_AVERAGES, EXPENSE_COLORS } from '@/mocks/assessmentMockData';

export interface ExpenseItem {
  label: string;
  amount: number;
  color: string;
  pct: number;
}

export interface ExpenseComparison {
  label: string;
  amount: number;
  average: number;
  difference: number;
  isDifference: boolean;
}

export function useExpensesTab(assessment: AssessmentDetailedDTO) {
  const expenses: ExpenseItem[] = Object.entries(assessment.expensesByCategory).map(([label, amount]) => ({
    label,
    amount,
    color: EXPENSE_COLORS[label] || '#9197ab',
    pct: assessment.monthlyExpenses > 0 ? Math.round((amount / assessment.monthlyExpenses) * 100) : 0,
  }));

  const comparisons: ExpenseComparison[] = expenses.map(e => ({
    label: e.label,
    amount: e.amount,
    average: UK_EXPENSE_AVERAGES[e.label] || 0,
    difference: e.amount - (UK_EXPENSE_AVERAGES[e.label] || 0),
    isDifference: true,
  }));

  const housingDiff = (assessment.expensesByCategory.Housing || 0) - (UK_EXPENSE_AVERAGES.Housing || 0);

  return {
    expenses,
    comparisons,
    housingDiff,
    totalExpenses: assessment.monthlyExpenses,
  };
}
