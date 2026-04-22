import { Assessment } from '@/journeys/Assessment/models/assessment';
import { CompletedAssessmentView } from '../completedAssessmentView/CompletedAssessmentView';
import styles from './AssessmentContent.module.css';
import { FailedBanner } from './FailedBanner';
import { PendingBanner } from './PendingBanner';

interface Props {
  assessment: Assessment;
  assessmentDate: string;
  isPending: boolean;
  isFailed: boolean;
  isCompleted: boolean;
  onExplorePaymentPlans: () => void;
}

export function AssessmentContent({ assessment, assessmentDate, isPending, isFailed, isCompleted, onExplorePaymentPlans }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.headingTitle}>Your Financial Assessment</h1>
        <p className={styles.headingSubtitle}>Based on 6 months of transaction data from your connected bank, assessed on {assessmentDate}.</p>
      </div>
      {isPending && <PendingBanner />}
      {isFailed && <FailedBanner />}
      {isCompleted && <CompletedAssessmentView assessment={assessment} assessmentDate={assessmentDate} onExplorePaymentPlans={onExplorePaymentPlans} />}
    </div>
  );
}