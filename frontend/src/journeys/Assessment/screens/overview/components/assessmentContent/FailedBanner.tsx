import { XCircleIcon } from '@/components/core/icons';
import styles from './AssessmentContent.module.css';

export function FailedBanner() {
  return (
    <div className={styles.failedMessage}>
      <XCircleIcon />
      Assessment calculation failed. Please try again or contact support.
    </div>
  );
}