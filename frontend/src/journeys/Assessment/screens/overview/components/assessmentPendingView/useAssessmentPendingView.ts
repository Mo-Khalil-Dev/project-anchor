export type PendingStepStatus = 'done' | 'active' | 'pending';

export interface PendingStep {
  label: string;
  status: PendingStepStatus;
  statusText: string;
}

const STEPS: PendingStep[] = [
  { label: 'Bank connection established', status: 'done', statusText: 'Connected' },
  { label: 'Analyzing 6 months of transactions', status: 'active', statusText: 'In progress…' },
  { label: 'Calculating your affordability', status: 'pending', statusText: 'Queued' },
];

export function useAssessmentPendingView() {
  return { steps: STEPS };
}
