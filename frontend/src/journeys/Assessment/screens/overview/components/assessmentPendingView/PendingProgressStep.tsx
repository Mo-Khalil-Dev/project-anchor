import { cn } from '@/lib/cn';
import type { PendingStep } from './useAssessmentPendingView';
import styles from './PendingProgressStep.module.css';

interface Props {
  step: PendingStep;
}

export function PendingProgressStep({ step }: Props) {
  return (
    <div className={styles.row}>
      <PendingStepIndicator status={step.status} />
      <div className={styles.text}>
        <p className={cn(styles.label, step.status === 'pending' && styles.labelPending)}>{step.label}</p>
        <p className={cn(styles.status, step.status === 'active' && styles.statusActive)}>{step.statusText}</p>
      </div>
    </div>
  );
}

function PendingStepIndicator({ status }: { status: PendingStep['status'] }) {
  if (status === 'done') {
    return (
      <div className={cn(styles.indicator, styles.indicatorDone)} aria-label="Step complete">
        <svg width={14} height={12} viewBox="0 0 14 12" fill="none">
          <path d="M1 6l4 4 8-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (status === 'active') {
    return (
      <div className={cn(styles.indicator, styles.indicatorActive)} aria-label="Step in progress">
        <div className={styles.spinner} />
      </div>
    );
  }
  return <div className={cn(styles.indicator, styles.indicatorPending)} aria-label="Step queued" />;
}
