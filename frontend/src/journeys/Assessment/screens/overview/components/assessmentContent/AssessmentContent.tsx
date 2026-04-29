import { Assessment } from '@/journeys/Assessment/models/assessment';
import { AssessmentPendingView } from '../assessmentPendingView/AssessmentPendingView';
import { CompletedAssessmentView } from '../completedAssessmentView/CompletedAssessmentView';
import styles from './AssessmentContent.module.css';
import { FailedBanner } from './FailedBanner';

interface Props {
  assessment: Assessment;
  assessmentDate: string;
  isPending: boolean;
  isFailed: boolean;
  isCompleted: boolean;
  onExplorePaymentPlans: () => void;
  onViewBreakdown: () => void;
}

export function AssessmentContent({ assessment, assessmentDate, isPending, isFailed, isCompleted, onExplorePaymentPlans, onViewBreakdown }: Props) {
  return (
    <div className={styles.page}>
      {!isPending && (
        <div className={styles.heading}>
          <h1 className={styles.headingTitle}>Your Financial Assessment</h1>
          <p className={styles.headingSubtitle}>Based on 6 months of transaction data from your connected bank, assessed on {assessmentDate}.</p>
        </div>
      )}
      {isPending && <AssessmentPendingView calculatedAt={assessment.calculatedAt} />}
      {isFailed && <FailedBanner />}
      {isCompleted && <CompletedAssessmentView assessment={assessment} onExplorePaymentPlans={onExplorePaymentPlans} onViewBreakdown={onViewBreakdown} />}
    </div>
  );
}
