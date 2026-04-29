import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { AssessmentContent } from './components/assessmentContent/AssessmentContent';
import { OverviewErrorState } from './components/overviewErrorState/OverviewErrorState';
import { OverviewLoadingState } from './components/overviewLoadingState/OverviewLoadingState';
import { useOverview } from './useOverview';
import { useJourneyGuard } from '@/hooks/useJourneyGuard';

export function AssessmentOverview() {
  const { assessment, loading, error, isPending, isFailed, isCompleted, assessmentDate, handleExplorePaymentPlans, handleViewBreakdown, handleGoBack } = useOverview();

  // Redirect if account setup or bank connection not yet complete
  const { status: guardStatus } = useJourneyGuard({
    blockedNextPages: ['/account-setup', '/bank-connection'],
  });

  if (guardStatus === 'checking') return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
    </div>
  );
  if (guardStatus === 'redirecting') return null;

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
          onViewBreakdown={handleViewBreakdown}
        />
      )}
    </CustomerLayout>
  );
}
