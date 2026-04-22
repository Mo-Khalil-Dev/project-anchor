import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { AssessmentContent } from './components/assessmentContent/AssessmentContent';
import { OverviewErrorState } from './components/overviewErrorState/OverviewErrorState';
import { OverviewLoadingState } from './components/overviewLoadingState/OverviewLoadingState';
import { useOverview } from './useOverview';

export function AssessmentOverview() {
  const { assessment, loading, error, isPending, isFailed, isCompleted, assessmentDate, handleExplorePaymentPlans, handleGoBack } = useOverview();

  return (
    <CustomerLayout currentStep={5} totalSteps={6}>
      {loading && !assessment && <OverviewLoadingState />}
      {error && !assessment && <OverviewErrorState error={error} onGoBack={handleGoBack} />}
      {assessment && (
        <AssessmentContent
          assessment={assessment}
          assessmentDate={assessmentDate}
          isPending={isPending}
          isFailed={isFailed}
          isCompleted={isCompleted}
          onExplorePaymentPlans={handleExplorePaymentPlans}
        />
      )}
    </CustomerLayout>
  );
}