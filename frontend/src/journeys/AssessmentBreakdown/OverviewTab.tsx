import type { AssessmentDetailedDTO } from '../../types';
import { Card, HardshipBadge } from '@/components/core';

export function OverviewTab({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const totalIncome = assessment.incomeSources.reduce((s, x) => s + x.amount, 0);
  const totalExpenses = assessment.monthlyExpenses;
  const disposable = assessment.disposableIncome;
  const incomePercent = totalIncome > 0 ? Math.round((disposable / totalIncome) * 100) : 0;

  type Row = { label: string; amount: string; bold?: boolean; type: 'income' | 'expense' | 'disposable' };
  const incomeRows: (Row | null)[] = [
    ...assessment.incomeSources.map(s => ({ label: s.type, amount: `£${s.amount.toLocaleString()}`, type: 'income' as const })),
    { label: 'Total Income', amount: `£${totalIncome.toLocaleString()}`, bold: true, type: 'income' as const },
    null,
    ...Object.entries(assessment.expensesByCategory).map(([k, v]) => ({ label: k, amount: `£${v}`, type: 'expense' as const })),
    { label: 'Total Expenses', amount: `£${totalExpenses.toLocaleString()}`, bold: true, type: 'expense' as const },
    null,
    { label: 'Disposable Income', amount: `£${disposable}`, bold: true, type: 'disposable' as const },
  ];

  const typeColor = { income: 'text-green', expense: 'text-amber', disposable: 'text-red' };

  return (
    <div className="grid grid-cols-2 gap-5">
      <Card>
        <div className="text-section-label text-muted mb-2">Income & Expenses</div>
        {incomeRows.map((r, i) =>
          r === null ? (
            <div key={i} className="h-px bg-divider my-2" />
          ) : (
            <div key={i} className="flex justify-between py-2 border-b border-divider last:border-b-0">
              <span className={`text-sm ${r.bold ? 'text-text font-bold' : 'text-sub'}`}>{r.label}</span>
              <span className={`text-sm ${r.bold ? `font-bold ${typeColor[r.type]}` : 'font-medium text-text'}`}>{r.amount}</span>
            </div>
          )
        )}
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <div className="text-section-label text-muted mb-2">Disposable Income Formula</div>
          <div className="text-sm text-sub leading-relaxed">
            Income <span className="text-green font-bold">£{totalIncome.toLocaleString()}</span> minus essential expenses{' '}
            <span className="text-amber font-bold">£{totalExpenses.toLocaleString()}</span> leaves{' '}
            <span className="text-red font-bold">£{disposable}/month</span> disposable income.
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-red rounded-full" style={{ width: `${Math.max(incomePercent, 2)}%` }} />
          </div>
          <div className="text-xs text-muted mt-2">
            {incomePercent}% of income is disposable — well below the 25% healthy threshold
          </div>
        </Card>

        <Card>
          <div className="text-section-label text-muted mb-2">Bill as % of Disposable</div>
          <div className="text-stat-figure text-red">{Math.round(assessment.billRatio)}%</div>
          <div className="text-xs text-sub mt-1">Benchmark average: <strong>5–8%</strong></div>
          <div className="mt-3"><HardshipBadge level={assessment.hardshipLevel} /></div>
        </Card>

        <Card className="bg-accent-bg border border-accent/20">
          <div className="text-sm text-accent leading-relaxed">
            Your bill of <strong>£{assessment.monthlyBill}</strong> would need{' '}
            <strong>{(assessment.monthlyBill / Math.max(disposable, 1)).toFixed(1)} months</strong> of your entire disposable income to clear — before any emergencies.
          </div>
        </Card>
      </div>
    </div>
  );
}
