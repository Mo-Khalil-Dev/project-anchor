import type { AssessmentDetailedDTO } from '@/types';
import { Card } from '@/components/core';
import { useWhyThisHappenedTab } from './useWhyThisHappenedTab';

export function WhyThisHappenedTab({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const { factorsWithStyles, actionPlan, colorClasses } = useWhyThisHappenedTab(assessment);

  return (
    <div className="flex flex-col gap-4">
      {factorsWithStyles.map(f => (
        <Card key={f.index} className={`border-l-4 ${f.borderClass}`}>
          <div className="flex gap-4 items-start">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-base flex-shrink-0 ${f.classes.bg} ${f.classes.text}`}>{f.index + 1}</div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2"><div className="text-base font-bold text-text">{f.title}</div><span className={`text-xs font-semibold px-3 py-1 rounded-full ${f.classes.bg} ${f.classes.text}`}>{f.severity.level} impact</span></div>
              <div className="text-sm text-sub leading-relaxed">{f.description}</div>
            </div>
          </div>
        </Card>
      ))}

      <div className="grid grid-cols-3 gap-3 mt-2">
        {actionPlan.map(s => (
          <Card key={s.period}>
            <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${colorClasses[s.color].text}`}>{s.period}</div>
            {s.actions.map(a => (<div key={a} className="flex items-start gap-2 mb-2"><span className={`font-bold text-base leading-none ${colorClasses[s.color].text}`}>·</span><span className="text-sm text-sub leading-snug">{a}</span></div>))}
          </Card>
        ))}
      </div>
    </div>
  );
}
