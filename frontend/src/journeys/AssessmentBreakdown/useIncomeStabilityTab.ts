import type { AssessmentDetailedDTO } from '../../types';
import { formatCurrency } from '@/utils/format';

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

const emptyState = {
  W: 480, H: 160, pad: 40,
  min: 0, max: 0, range: 0, avg: 0, avgY: 0,
  gridLines: [] as number[], chartPoints: [] as ChartPoint[], pathD: '',
  highest: { month: 'N/A', amount: 0 },
  lowest: { month: 'N/A', amount: 0 },
  variance: 0, stability: 'N/A',
  summaryRows: [] as IncomeSummaryRow[],
};

export function useIncomeStabilityTab(assessment: AssessmentDetailedDTO) {
  try {
    const months = assessment.incomeHistory || [];
    if (!months || months.length === 0) return emptyState;

    const W = 480, H = 160, pad = 40;
    const amounts = months.map(m => m.amount).filter(a => typeof a === 'number' && !isNaN(a));

    if (amounts.length === 0) return emptyState;

    const min = Math.floor(Math.min(...amounts) / 100) * 100 - 100;
    const max = Math.ceil(Math.max(...amounts) / 100) * 100 + 100;
    const range = max - min || 1;
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    const chartPoints: ChartPoint[] = months.map((d, i) => ({
      x: pad + (i / Math.max(months.length - 1, 1)) * (W - pad * 2),
      y: pad + (1 - (d.amount - min) / range) * (H - pad * 2),
      month: d.month,
      amount: d.amount,
    }));

    const pathD = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const avgY = pad + (1 - (avg - min) / range) * (H - pad * 2);

    const gridLines: number[] = [];
    for (let v = min + 200; v < max; v += 200) gridLines.push(v);

    const highest = months.reduce((a, b) => (a.amount > b.amount ? a : b), months[0]);
    const lowest = months.reduce((a, b) => (a.amount < b.amount ? a : b), months[0]);
    const variance = highest.amount - lowest.amount;
    const stability = variance < 200 ? 'High' : variance < 500 ? 'Moderate' : 'Low';

    const summaryRows: IncomeSummaryRow[] = [
      { label: 'Average monthly income', value: `£${formatCurrency(avg)}` },
      { label: `Highest month (${highest.month})`, value: `£${formatCurrency(highest.amount)}` },
      { label: `Lowest month (${lowest.month})`, value: `£${formatCurrency(lowest.amount)}` },
      { label: 'Variance', value: `£${formatCurrency(variance)}` },
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
  } catch (error) {
    console.error('Error in useIncomeStabilityTab:', error);
    return emptyState;
  }
}
