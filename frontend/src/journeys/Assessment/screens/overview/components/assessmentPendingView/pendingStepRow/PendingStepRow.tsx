import { cn } from '@/lib/cn';
import styles from './PendingStepRow.module.css';

export type PendingStepStatus = 'done' | 'active' | 'pending';

interface Props {
  label: string;
  status: PendingStepStatus;
}

export function PendingStepRow({ label, status }: Props) {
  return (
    <div
      className={cn(
        styles.row,
        status === 'done' && styles.rowDone,
        status === 'active' && styles.rowActive,
        status === 'pending' && styles.rowPending,
      )}
    >
      <StepIcon status={status} />
      <p
        className={cn(
          styles.label,
          status === 'done' && styles.labelDone,
          status === 'active' && styles.labelActive,
          status === 'pending' && styles.labelPending,
        )}
      >
        {label}
      </p>
    </div>
  );
}

function StepIcon({ status }: { status: PendingStepStatus }) {
  if (status === 'done') {
    return (
      <span className={cn(styles.icon, styles.iconDone)} aria-label="Step complete">
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
          <path d="M1 5l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (status === 'active') {
    return <span className={cn(styles.icon, styles.iconActive)} aria-label="Step in progress" />;
  }
  return <span className={cn(styles.icon, styles.iconPending)} aria-label="Step pending" />;
}
