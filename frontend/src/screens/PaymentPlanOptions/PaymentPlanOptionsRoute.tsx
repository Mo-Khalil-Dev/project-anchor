import { useAssessmentBreakdown } from '../../hooks/useAssessmentBreakdown';
import { PaymentPlanOptions } from './PaymentPlanOptions';

export function PaymentPlanOptionsRoute() {
  const { assessment, isLoading, error } = useAssessmentBreakdown();

  if (isLoading) return <div style={{ padding: 32, textAlign: 'center' }}>Loading payment plans...</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>Error: {error}</div>;
  if (!assessment) return <div style={{ padding: 32 }}>No assessment found</div>;

  return <PaymentPlanOptions assessment={assessment} />;
}
