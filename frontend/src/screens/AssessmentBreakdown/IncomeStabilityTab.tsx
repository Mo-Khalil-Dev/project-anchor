import type { AssessmentDetailedDTO } from '../../types';
import { Card } from '@/components/core';

export function IncomeStabilityTab({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const months = assessment.incomeHistory;
  const W = 480, H = 160, pad = 40;
  const amounts = months.map(m => m.amount);
  const min = Math.floor(Math.min(...amounts) / 100) * 100 - 100;
  const max = Math.ceil(Math.max(...amounts) / 100) * 100 + 100;
  const range = max - min;
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;

  const pts = months.map((d, i) => ({
    x: pad + (i / (months.length - 1)) * (W - pad * 2),
    y: pad + (1 - (d.amount - min) / range) * (H - pad * 2),
    ...d,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const avgY = pad + (1 - (avg - min) / range) * (H - pad * 2);

  const gridLines = [];
  for (let v = min + 200; v < max; v += 200) gridLines.push(v);

  const highest = months.reduce((a, b) => (a.amount > b.amount ? a : b));
  const lowest = months.reduce((a, b) => (a.amount < b.amount ? a : b));
  const variance = highest.amount - lowest.amount;
  const stability = variance < 200 ? 'High' : variance < 500 ? 'Moderate' : 'Low';

  return (
    <div className="grid grid-cols-2 gap-5">
      <Card>
        <div className="text-section-label text-muted mb-2">6-Month Income Chart</div>
        <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ overflow: 'visible', marginTop: 8, width: '100%' }}>
          {gridLines.map(v => {
            const y = pad + (1 - (v - min) / range) * (H - pad * 2);
            return (
              <g key={v}>
                <line x1={pad} y1={y} x2={W - pad} y2={y} stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
                <text x={pad - 8} y={y + 4} fontSize="10" fill="#9197ab" textAnchor="end">£{v}</text>
              </g>
            );
          })}
          <line x1={pad} y1={avgY} x2={W - pad} y2={avgY} stroke="oklch(52% 0.18 270)" strokeWidth="1.5" strokeDasharray="5,4" />
          <text x={W - pad + 6} y={avgY + 4} fontSize="10" fill="oklch(52% 0.18 270)">avg</text>
          <defs>
            <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(52% 0.18 270)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="oklch(52% 0.18 270)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${pathD} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`} fill="url(#ig)" />
          <path d={pathD} stroke="oklch(52% 0.18 270)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map(p => (
            <g key={p.month}>
              <circle cx={p.x} cy={p.y} r="5" fill="oklch(52% 0.18 270)" stroke="#fff" strokeWidth="2" />
              <text x={p.x} y={H + 16} fontSize="11" fill="#9197ab" textAnchor="middle">{p.month}</text>
            </g>
          ))}
        </svg>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <div className="text-section-label text-muted mb-2">Income Summary</div>
          {[
            { l: 'Average monthly income', v: `£${Math.round(avg).toLocaleString()}` },
            { l: `Highest month (${highest.month})`, v: `£${highest.amount.toLocaleString()}` },
            { l: `Lowest month (${lowest.month})`, v: `£${lowest.amount.toLocaleString()}` },
            { l: 'Variance', v: `£${variance}` },
            { l: 'Stability', v: stability },
          ].map(r => (
            <div key={r.l} className="flex justify-between py-2 border-b border-divider last:border-b-0">
              <span className="text-sm text-sub">{r.l}</span>
              <span className="text-sm font-semibold text-text">{r.v}</span>
            </div>
          ))}
        </Card>
        <Card className="bg-green-bg border border-green/30">
          <div className="text-sm leading-relaxed" style={{ color: 'oklch(38% 0.17 145)' }}>
            Income is <strong>{stability.toLowerCase()}ly stable</strong> — regular salary plus benefits. The {highest.month} spike likely reflects an annual bonus or holiday pay.
          </div>
        </Card>
      </div>
    </div>
  );
}
