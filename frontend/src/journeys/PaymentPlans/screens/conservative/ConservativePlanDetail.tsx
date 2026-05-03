import type { AssessmentDetailedDTO } from '@/types';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { useConservativePlanDetail } from './useConservativePlanDetail';
import { PlanDetailHeader } from '../components/PlanDetailHeader';
import { PlanDetailsContent } from '../components/PlanDetailsContent';
import { PlanActionButtons } from '../components/PlanActionButtons';

export function ConservativePlanDetail({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const plan = assessment.paymentPlans.find(p => p.type === 'Conservative')!;
  const { handleSelectPlan, handleBack } = useConservativePlanDetail();
  const buffer = assessment.disposableIncome - plan.monthlyAmount;

  return (
    <CustomerLayout>
      <PlanDetailHeader title="Conservative Plan" subtitle="Our recommended option — lowest monthly commitment, highest chance of success." />
      <PlanDetailsContent plan={plan} assessment={assessment} buffer={buffer} color="conservative" />
      <PlanActionButtons onSelect={handleSelectPlan} onBack={handleBack} selectText="Select Conservative Plan" />
    </CustomerLayout>
  );
}
