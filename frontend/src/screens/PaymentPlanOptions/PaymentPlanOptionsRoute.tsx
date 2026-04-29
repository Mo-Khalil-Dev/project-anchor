import { useAssessmentBreakdown } from '../../hooks/useAssessmentBreakdown';
import { useJourneyGuard } from '@/hooks/useJourneyGuard';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { PaymentPlanOptions } from './PaymentPlanOptions';

export function PaymentPlanOptionsRoute() {
  const { status: guardStatus } = useJourneyGuard({
    blockedNextPages: ['/account-setup', '/bank-connection'],
  });

  const { assessment, isLoading, error } = useAssessmentBreakdown();

  if (guardStatus === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }
  if (guardStatus === 'redirecting') return null;

  if (isLoading) return <CustomerLayout><div className="text-sub py-12 text-center">Loading payment plans...</div></CustomerLayout>;
  if (error) return <CustomerLayout><div className="text-red py-12 text-center">Error: {error}</div></CustomerLayout>;
  if (!assessment) return <CustomerLayout><div className="text-sub py-12 text-center">No assessment found</div></CustomerLayout>;

  return <PaymentPlanOptions assessment={assessment} />;
}
