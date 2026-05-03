import type { AssessmentDetailedDTO } from '@/types';
import { formatCurrency } from '@/utils/format';

export interface IncomeExpenseRow {
  label: string;
  amount: string;
  bold?: boolean;
  type: 'income' | 'expense' | 'disposable';
}

export function useOverviewTab(assessment: AssessmentDetailedDTO) {
  const totalIncome = assessment.monthlyIncome;
  const totalExpenses = assessment.monthlyExpenses;
  const disposable = assessment.disposableIncome;
  const incomePercent = totalIncome > 0 ? Math.round((disposable / totalIncome) * 100) : 0;
  const billMonthsNeeded = (assessment.monthlyBill / Math.max(disposable, 1)).toFixed(1);

  const incomeExpenseRows: (IncomeExpenseRow | null)[] = [
    ...assessment.incomeSources.map(s => ({
      label: s.type,
      amount: `£${formatCurrency(s.amount)}`,
      type: 'income' as const,
    })),
    { label: 'Total Income', amount: `£${formatCurrency(totalIncome)}`, bold: true, type: 'income' as const },
    null,
    ...Object.entries(assessment.expensesByCategory).map(([k, v]) => ({
      label: k,
      amount: `£${formatCurrency(v)}`,
      type: 'expense' as const,
    })),
    { label: 'Total Expenses', amount: `£${formatCurrency(totalExpenses)}`, bold: true, type: 'expense' as const },
    null,
    { label: 'Disposable Income', amount: `£${formatCurrency(disposable)}`, bold: true, type: 'disposable' as const },
  ];

  const typeColorMap = {
    income: 'text-green',
    expense: 'text-amber',
    disposable: 'text-red',
  };

  return {
    totalIncome,
    totalExpenses,
    disposable,
    incomePercent,
    billMonthsNeeded,
    incomeExpenseRows,
    typeColorMap,
  };
}
