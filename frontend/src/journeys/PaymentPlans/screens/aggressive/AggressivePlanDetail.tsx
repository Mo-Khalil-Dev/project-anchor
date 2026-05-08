import type { AssessmentDetailedDTO } from '@/types';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Button } from '@/components/core';
import { useAggressivePlanDetail } from './useAggressivePlanDetail';
import { PlanDetailHeader, PlanDetailsContent, WarningBanner, ConfirmationGate } from '../components';
import styles from './AggressivePlanDetail.module.css';

export function AggressivePlanDetail({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const plan = assessment.paymentPlans.find(p => p.type === 'Aggressive')!;
  const { confirmed, setConfirmed, handleSelectPlan, handleSwitchToConservative } = useAggressivePlanDetail();

  return (
    <CustomerLayout>
      <PlanDetailHeader title="Aggressive Plan" subtitle="Fastest option — but our assessment shows this plan is high risk for your financial situation." />
      <WarningBanner title="High risk — not recommended for your situation" text="This plan requires £140/month — which exceeds your £130 disposable income. Any missed payment will add to your balance and make recovery harder." />
      <PlanDetailsContent plan={plan} assessment={assessment} buffer={assessment.disposableIncome - plan.monthlyAmount} color="aggressive" />
      <ConfirmationGate confirmed={confirmed} setConfirmed={setConfirmed} />
      <div className={styles.actions}>
        <Button variant="danger" onClick={handleSelectPlan} disabled={!confirmed} className={styles.fullWidth}>
          Select Aggressive Plan
        </Button>
        <Button variant="primary" onClick={handleSwitchToConservative} className={styles.fullWidth}>
          Switch to Conservative (Recommended)
        </Button>
      </div>
    </CustomerLayout>
  );
}
