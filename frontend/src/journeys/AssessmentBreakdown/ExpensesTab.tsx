import type { AssessmentDetailedDTO } from '../../types';
import { Card } from '@/components/core';
import { useExpensesTab } from './useExpensesTab';
import { formatCurrency } from '@/utils/format';

export function ExpensesTab({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const { expenses, comparisons, housingDiff, totalExpenses } = useExpensesTab(assessment);

  return (
    <div className="grid grid-cols-2 gap-5">
      <Card>
        <div className="text-section-label text-muted mb-2">Spending by Category</div>
        <div className="flex flex-col gap-3 mt-2">
          {expenses.map(e => (
            <div key={e.label}>
              <div className="flex justify-between mb-1"><span className="text-sm text-text font-medium">{e.label}</span><span className="text-sm font-semibold text-text">£{formatCurrency(e.amount)}<span className="text-xs text-muted font-normal"> / mo</span></span></div>
              {e.amount > 0 && <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${e.pct}%`, background: e.color }} /></div>}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-divider flex justify-between text-sm font-bold"><span>Total</span><span className="text-amber">£{formatCurrency(totalExpenses)}/mo</span></div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <div className="text-section-label text-muted mb-2">Vs. Average Household (UK)</div>
          <div className="flex flex-col gap-2 mt-2">
            {comparisons.map(c => (
              <div key={c.label} className="flex justify-between items-center text-sm">
                <span className="text-sub w-32">{c.label}</span>
                <div className="flex gap-4"><span className="text-text font-semibold w-20 text-right">£{formatCurrency(c.amount)}</span><span className="text-muted w-20 text-right">£{formatCurrency(c.average)}</span><span className={`font-semibold w-24 text-right ${c.difference > 0 ? 'text-red' : 'text-green'}`}>{c.difference > 0 ? '+' : ''}£{formatCurrency(c.difference)}</span></div>
              </div>
            ))}
            <div className="flex justify-end gap-4 text-xs text-muted mt-1"><span className="w-20 text-right">Yours</span><span className="w-20 text-right">Avg</span><span className="w-24 text-right">Diff</span></div>
          </div>
        </Card>

        <Card className="bg-amber-bg border border-amber/30">
          <div className="text-sm leading-relaxed" style={{ color: 'oklch(45% 0.16 76)' }}>Housing costs are <strong>£{formatCurrency(housingDiff)} above average</strong> — the biggest driver of your tight budget. This may be worth discussing with a debt adviser.</div>
        </Card>
      </div>
    </div>
  );
}
