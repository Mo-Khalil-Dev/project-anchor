import { Button } from '@/components/core/Button';
import styles from './CompletedAssessmentView.module.css';

interface Props { onExplorePaymentPlans: () => void; }

export function AssessmentCTAs({ onExplorePaymentPlans }: Props) {
  return (
    <div className={styles.ctaRow}>
      <Button className={styles.ctaButton} variant="primary" onClick={onExplorePaymentPlans}>
        Explore Payment Plans
      </Button>
      <Button className={styles.ctaButton} variant="ghost">
        View Detailed Breakdown
      </Button>
    </div>
  );
}