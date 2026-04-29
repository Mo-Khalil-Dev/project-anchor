import type { AssessmentDetailedDTO } from '../../types';
import { Card } from '@/components/core';
import { FACTOR_SEVERITY } from '../../mocks/assessmentMockData';

const COLOR_CLASSES: Record<string, { bar: string; bg: string; text: string; ring: string }> = {
  red: { bar: '#dc2626', bg: 'bg-red-bg', text: 'text-red', ring: 'oklch(52% 0.18 25)' },
  amber: { bar: '#d97706', bg: 'bg-amber-bg', text: 'text-amber', ring: 'oklch(62% 0.16 76)' },
  green: { bar: '#16a34a', bg: 'bg-green-bg', text: 'text-green', ring: 'oklch(51% 0.17 145)' },
};

const ACTION_PLAN = [
  { period: 'Short-term', actions: ['Set up a payment plan', 'Contact debt advice service'], color: 'red' },
  { period: 'Medium-term', actions: ['Review housing costs', 'Apply for Warm Home Discount'], color: 'amber' },
  { period: 'Long-term', actions: ['Build emergency fund', 'Review benefits entitlement'], color: 'green' },
] as const;

export function WhyThisHappenedTab({ assessment }: { assessment: AssessmentDetailedDTO }) {
  return (
    <div className="flex flex-col gap-4">
      {assessment.factors.map((f, i) => {
        const sev = FACTOR_SEVERITY[f.title] || { level: 'Medium' as const, color: 'amber' as const };
        const cls = COLOR_CLASSES[sev.color];
        const borderClass = sev.color === 'red' ? 'border-l-red' : sev.color === 'amber' ? 'border-l-amber' : 'border-l-green';
        return (
          <Card key={i} className={`border-l-4 ${borderClass}`}>
            <div className="flex gap-4 items-start">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-base flex-shrink-0 ${cls.bg} ${cls.text}`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-base font-bold text-text">{f.title}</div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cls.bg} ${cls.text}`}>
                    {sev.level} impact
                  </span>
                </div>
                <div className="text-sm text-sub leading-relaxed">{f.description}</div>
              </div>
            </div>
          </Card>
        );
      })}

      <div className="grid grid-cols-3 gap-3 mt-2">
        {ACTION_PLAN.map(s => {
          const cls = COLOR_CLASSES[s.color];
          return (
            <Card key={s.period}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${cls.text}`}>{s.period}</div>
              {s.actions.map(a => (
                <div key={a} className="flex items-start gap-2 mb-2">
                  <span className={`font-bold text-base leading-none ${cls.text}`}>·</span>
                  <span className="text-sm text-sub leading-snug">{a}</span>
                </div>
              ))}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
