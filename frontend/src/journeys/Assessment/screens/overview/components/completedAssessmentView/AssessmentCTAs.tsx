import { Button } from '@/components/core/Button';
import styles from './CompletedAssessmentView.module.css';

interface Props {
  onExplorePaymentPlans: () => void;
  onViewBreakdown: () => void;
}

export function AssessmentCTAs({ onExplorePaymentPlans, onViewBreakdown }: Props) {
  return (
    <div className={styles.ctaRow}>
      <Button className={styles.ctaButton} variant="primary" onClick={onExplorePaymentPlans}>
        Explore Payment Plans
      </Button>
      <Button className={styles.ctaButton} variant="ghost" onClick={onViewBreakdown}>
        View Detailed Breakdown
      </Button>
    </div>
  );
}