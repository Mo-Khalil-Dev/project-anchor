import type { AssessmentDetailedDTO } from '../../types';
import { FACTOR_SEVERITY } from '../../mocks/assessmentMockData';

export const COLOR_CLASSES: Record<string, { bar: string; bg: string; text: string; ring: string }> = {
  red: { bar: '#dc2626', bg: 'bg-red-bg', text: 'text-red', ring: 'oklch(52% 0.18 25)' },
  amber: { bar: '#d97706', bg: 'bg-amber-bg', text: 'text-amber', ring: 'oklch(62% 0.16 76)' },
  green: { bar: '#16a34a', bg: 'bg-green-bg', text: 'text-green', ring: 'oklch(51% 0.17 145)' },
};

export const ACTION_PLAN = [
  { period: 'Short-term', actions: ['Set up a payment plan', 'Contact debt advice service'], color: 'red' },
  { period: 'Medium-term', actions: ['Review housing costs', 'Apply for Warm Home Discount'], color: 'amber' },
  { period: 'Long-term', actions: ['Build emergency fund', 'Review benefits entitlement'], color: 'green' },
] as const;

export interface FactorWithStyles {
  title: string;
  description: string;
  severity: { level: 'High' | 'Medium' | 'Low'; color: 'red' | 'amber' | 'green' };
  classes: { bar: string; bg: string; text: string; ring: string };
  borderClass: string;
  index: number;
}

export function useWhyThisHappenedTab(assessment: AssessmentDetailedDTO) {
  const factorsWithStyles: FactorWithStyles[] = assessment.factors.map((f, i) => {
    const severity = FACTOR_SEVERITY[f.title] || { level: 'Medium' as const, color: 'amber' as const };
    const classes = COLOR_CLASSES[severity.color];
    const borderClass = severity.color === 'red' ? 'border-l-red' : severity.color === 'amber' ? 'border-l-amber' : 'border-l-green';
    return {
      title: f.title,
      description: f.description,
      severity,
      classes,
      borderClass,
      index: i,
    };
  });

  return {
    factorsWithStyles,
    actionPlan: ACTION_PLAN,
    colorClasses: COLOR_CLASSES,
  };
}
