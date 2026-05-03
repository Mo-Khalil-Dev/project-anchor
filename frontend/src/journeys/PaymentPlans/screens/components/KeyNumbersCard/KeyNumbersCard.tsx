import type { PaymentPlanDTO } from '@/types';
import { Card } from '@/components/core';
import styles from './PlanDetails.module.css';

export function KeyNumbersCard({ plan, assessment, buffer }: { plan: PaymentPlanDTO; assessment: any; buffer: number }) {
  const isNegative = buffer < 0;

  return (
    <Card className={styles.keyNumbers}>
      {[
        ['Duration', `${plan.duration} months`],
        ['Total paid', `£${plan.totalRepayment}`],
        ['Monthly buffer', isNegative ? `–£${Math.abs(buffer)} (over budget)` : `£${buffer}`],
        ['Disposable remaining', `£${Math.abs(buffer)} / £${assessment.disposableIncome} (${Math.round((Math.abs(buffer) / assessment.disposableIncome) * 100)}%)`],
      ].map(([k, v]) => (
        <div key={k} className={styles.row}>
          <span className={styles.rowLabel}>{k}</span>
          <span className={k.includes('buffer') && isNegative ? styles.negativeValue : styles.rowValue}>{v}</span>
        </div>
      ))}
    </Card>
  );
}
