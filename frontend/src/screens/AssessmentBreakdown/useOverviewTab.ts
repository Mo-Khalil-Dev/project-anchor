import type { AssessmentDetailedDTO } from '../../types';
import { UK_EXPENSE_AVERAGES } from '../../mocks/assessmentMockData';

export interface ExpenseComparison {
  category: string;
  yourAmount: number;
  ukAverage: number;
  difference: number;
  percentDifference: number;
}

export function useOverviewTab(assessment: AssessmentDetailedDTO) {
  const expenseComparisons: ExpenseComparison[] = Object.entries(
    assessment.expensesByCategory
  ).map(([category, amount]) => {
    const ukAvg = UK_EXPENSE_AVERAGES[category as keyof typeof UK_EXPENSE_AVERAGES] || 0;
    const diff = amount - ukAvg;
    const percentDiff = ukAvg > 0 ? (diff / ukAvg) * 100 : 0;

    return {
      category,
      yourAmount: amount,
      ukAverage: ukAvg,
      difference: diff,
      percentDifference: percentDiff,
    };
  });

  const totalExpenses = assessment.monthlyExpenses;
  const totalUkAverage = Object.values(UK_EXPENSE_AVERAGES).reduce((a, b) => a + b, 0);
  const totalDifference = totalExpenses - totalUkAverage;
  const totalPercentDiff = (totalDifference / totalUkAverage) * 100;

  return {
    expenseComparisons,
    totalExpenses,
    totalUkAverage,
    totalDifference,
    totalPercentDiff,
  };
}
