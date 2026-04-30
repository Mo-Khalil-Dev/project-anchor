import type { AssessmentDetailedDTO } from '../../types';
import { Card, HardshipBadge } from '@/components/core';
import { useOverviewTab } from './useOverviewTab';

export function OverviewTab({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const { totalIncome, totalExpenses, disposable, incomePercent, billMonthsNeeded, incomeExpenseRows, typeColorMap } = useOverviewTab(assessment);

  return (
    <div className="grid grid-cols-2 gap-5">
      <Card>
        <div className="text-section-label text-muted mb-2">Income & Expenses</div>
        {incomeExpenseRows.map((r, i) => r === null ? <div key={i} className="h-px bg-divider my-2" /> : (
          <div key={i} className="flex justify-between py-2 border-b border-divider last:border-b-0">
            <span className={`text-sm ${r.bold ? 'text-text font-bold' : 'text-sub'}`}>{r.label}</span>
            <span className={`text-sm ${r.bold ? `font-bold ${typeColorMap[r.type]}` : 'font-medium text-text'}`}>{r.amount}</span>
          </div>
        ))}
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <div className="text-section-label text-muted mb-2">Disposable Income Formula</div>
          <div className="text-sm text-sub leading-relaxed">Income <span className="text-green font-bold">£{totalIncome.toLocaleString()}</span> minus essential expenses <span className="text-amber font-bold">£{totalExpenses.toLocaleString()}</span> leaves <span className="text-red font-bold">£{disposable}/month</span> disposable income.</div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-red rounded-full" style={{ width: `${Math.max(incomePercent, 2)}%` }} /></div>
          <div className="text-xs text-muted mt-2">{incomePercent}% of income is disposable — well below the 25% healthy threshold</div>
        </Card>

        <Card>
          <div className="text-section-label text-muted mb-2">Bill as % of Disposable</div>
          <div className="text-stat-figure text-red">{Math.round(assessment.billRatio)}%</div>
          <div className="text-xs text-sub mt-1">Benchmark average: <strong>5–8%</strong></div>
          <div className="mt-3"><HardshipBadge level={assessment.hardshipLevel} /></div>
        </Card>

        <Card className="bg-accent-bg border border-accent/20">
          <div className="text-sm text-accent leading-relaxed">Your bill of <strong>£{assessment.monthlyBill}</strong> would need <strong>{billMonthsNeeded} months</strong> of your entire disposable income to clear — before any emergencies.</div>
        </Card>
      </div>
    </div>
  );
}
