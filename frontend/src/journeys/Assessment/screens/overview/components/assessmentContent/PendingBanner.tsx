import { ClockIcon } from '@/components/core/icons';
import styles from './AssessmentContent.module.css';

export function PendingBanner() {
  return (
    <div className={styles.pendingMessage}>
      <ClockIcon />
      Your assessment is still calculating. We're analysing your financial situation...
    </div>
  );
}