import type { AssessmentDetailedDTO } from '@/types';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { useBalancedPlanDetail } from './useBalancedPlanDetail';
import { PlanDetailHeader } from '../components/PlanDetailHeader';
import { PlanDetailsContent } from '../components/PlanDetailsContent';
import { PlanActionButtons } from '../components/PlanActionButtons';

export function BalancedPlanDetail({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const plan = assessment.paymentPlans.find(p => p.type === 'Balanced')!;
  const { handleSelectPlan, handleBack } = useBalancedPlanDetail();
  const buffer = assessment.disposableIncome - plan.monthlyAmount;

  return (
    <CustomerLayout>
      <PlanDetailHeader title="Balanced Plan" subtitle="A middle-ground option — clears your debt in half the time with moderate risk." />
      <PlanDetailsContent plan={plan} assessment={assessment} buffer={buffer} color="balanced" />
      <PlanActionButtons onSelect={handleSelectPlan} onBack={handleBack} selectText="Select Balanced Plan" />
    </CustomerLayout>
  );
}
