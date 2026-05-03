import type { PaymentPlanDTO } from '@/types';
import { Card, SustBadge } from '@/components/core';
import styles from './PlanDetails.module.css';

export function MonthlyPaymentCard({ plan, color }: { plan: PaymentPlanDTO; color: 'conservative' | 'balanced' | 'aggressive' }) {
  const colorClass = color === 'conservative' ? styles.labelGreen : color === 'balanced' ? styles.labelAmber : styles.labelRed;
  const amountClass = color === 'conservative' ? styles.amountGreen : color === 'balanced' ? styles.amountAmber : styles.amountRed;

  return (
    <Card className={`${styles.monthlyCard} ${styles[color]}`}>
      <div className={colorClass}>Monthly Payment</div>
      <div className={amountClass}>£{plan.monthlyAmount}</div>
      <div className={styles.period}>/month</div>
      <div style={{ marginTop: 12 }}>
        <SustBadge level={plan.sustainability} />
      </div>
    </Card>
  );
}
