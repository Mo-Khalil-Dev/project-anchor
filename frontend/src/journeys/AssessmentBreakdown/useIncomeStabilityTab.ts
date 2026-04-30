import type { AssessmentDetailedDTO } from '../../types';

export interface ChartPoint {
  x: number;
  y: number;
  month: string;
  amount: number;
}

export interface IncomeSummaryRow {
  label: string;
  value: string;
}

export function useIncomeStabilityTab(assessment: AssessmentDetailedDTO) {
  const months = assessment.incomeHistory;
  const W = 480, H = 160, pad = 40;
  const amounts = months.map(m => m.amount);
  const min = Math.floor(Math.min(...amounts) / 100) * 100 - 100;
  const max = Math.ceil(Math.max(...amounts) / 100) * 100 + 100;
  const range = max - min;
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;

  const chartPoints: ChartPoint[] = months.map((d, i) => ({
    x: pad + (i / (months.length - 1)) * (W - pad * 2),
    y: pad + (1 - (d.amount - min) / range) * (H - pad * 2),
    month: d.month,
    amount: d.amount,
  }));

  const pathD = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const avgY = pad + (1 - (avg - min) / range) * (H - pad * 2);

  const gridLines = [];
  for (let v = min + 200; v < max; v += 200) gridLines.push(v);

  const highest = months.reduce((a, b) => (a.amount > b.amount ? a : b));
  const lowest = months.reduce((a, b) => (a.amount < b.amount ? a : b));
  const variance = highest.amount - lowest.amount;
  const stability = variance < 200 ? 'High' : variance < 500 ? 'Moderate' : 'Low';

  const summaryRows: IncomeSummaryRow[] = [
    { label: 'Average monthly income', value: `£${Math.round(avg).toLocaleString()}` },
    { label: `Highest month (${highest.month})`, value: `£${highest.amount.toLocaleString()}` },
    { label: `Lowest month (${lowest.month})`, value: `£${lowest.amount.toLocaleString()}` },
    { label: 'Variance', value: `£${variance}` },
    { label: 'Stability', value: stability },
  ];

  return {
    W, H, pad,
    min, max, range,
    avg, avgY,
    gridLines,
    chartPoints,
    pathD,
    highest,
    lowest,
    variance,
    stability,
    summaryRows,
  };
}
