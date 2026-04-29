import type { AssessmentDetailedDTO } from '../../types';
import { Card } from '@/components/core';
import { UK_EXPENSE_AVERAGES, EXPENSE_COLORS } from '../../mocks/assessmentMockData';

export function ExpensesTab({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const expenses = Object.entries(assessment.expensesByCategory).map(([label, amount]) => ({
    label,
    amount,
    color: EXPENSE_COLORS[label] || '#9197ab',
    pct: Math.round((amount / assessment.monthlyExpenses) * 100),
  }));

  return (
    <div className="grid grid-cols-2 gap-5">
      <Card>
        <div className="text-section-label text-muted mb-2">Spending by Category</div>
        <div className="flex flex-col gap-3 mt-2">
          {expenses.map(e => (
            <div key={e.label}>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-text font-medium">{e.label}</span>
                <span className="text-sm font-semibold text-text">£{e.amount}<span className="text-xs text-muted font-normal"> / mo</span></span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${e.pct}%`, background: e.color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-divider flex justify-between text-sm font-bold">
          <span>Total</span>
          <span className="text-amber">£{assessment.monthlyExpenses.toLocaleString()}/mo</span>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <div className="text-section-label text-muted mb-2">Vs. Average Household (UK)</div>
          <div className="flex flex-col gap-2 mt-2">
            {expenses.map(e => {
              const avg = UK_EXPENSE_AVERAGES[e.label] || 0;
              const diff = e.amount - avg;
              return (
                <div key={e.label} className="flex justify-between items-center text-sm">
                  <span className="text-sub w-32">{e.label}</span>
                  <div className="flex gap-4">
                    <span className="text-text font-semibold w-12 text-right">£{e.amount}</span>
                    <span className="text-muted w-12 text-right">£{avg}</span>
                    <span className={`font-semibold w-14 text-right ${diff > 0 ? 'text-red' : 'text-green'}`}>
                      {diff > 0 ? '+' : ''}£{diff}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="flex justify-end gap-4 text-xs text-muted mt-1">
              <span className="w-12 text-right">Yours</span>
              <span className="w-12 text-right">Avg</span>
              <span className="w-14 text-right">Diff</span>
            </div>
          </div>
        </Card>

        <Card className="bg-amber-bg border border-amber/30">
          <div className="text-sm leading-relaxed" style={{ color: 'oklch(45% 0.16 76)' }}>
            Housing costs are <strong>£{(assessment.expensesByCategory.Housing || 0) - (UK_EXPENSE_AVERAGES.Housing || 0)} above average</strong> — the biggest driver of your tight budget. This may be worth discussing with a debt adviser.
          </div>
        </Card>
      </div>
    </div>
  );
}
