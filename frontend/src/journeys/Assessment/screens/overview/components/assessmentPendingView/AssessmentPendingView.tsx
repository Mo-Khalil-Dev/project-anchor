import { HourglassIcon } from '@/components/core/icons';
import styles from './AssessmentPendingView.module.css';
import { PendingProgressStep } from './PendingProgressStep';
import { useAssessmentPendingView } from './useAssessmentPendingView';

export function AssessmentPendingView() {
  const { steps } = useAssessmentPendingView();
  return (
    <div className={styles.container}>
      <div className={styles.iconWrap}>
        <HourglassIcon width={48} height={48} />
      </div>
      <h1 className={styles.title}>We're analyzing your finances</h1>
      <p className={styles.subtitle}>This usually takes about 30 seconds. Hang tight while we crunch the numbers.</p>
      <div className={styles.stepsCard}>
        {steps.map((step) => <PendingProgressStep key={step.label} step={step} />)}
      </div>
      <p className={styles.note}>You can leave this page and come back — we'll be ready when you return.</p>
    </div>
  );
}
