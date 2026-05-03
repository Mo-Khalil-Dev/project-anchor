import { Card } from '@/components/core';
import styles from './PlanDetails.module.css';

export function PaymentTimeline({ monthlyAmount, duration, firstDate, finalDate }: { monthlyAmount: number; duration: number; firstDate: string; finalDate: string }) {
  return (
    <Card className={styles.timelineCard}>
      <h3 className={styles.sectionLabel}>Your {duration}-month timeline</h3>
      <div className={styles.timeline}>
        {Array.from({ length: duration }).map((_, i) => (
          <div key={i} className={styles.timelineMonth}>
            <div className={`${styles.monthCircle} ${i === 0 ? styles.first : ''}`}>{i + 1}</div>
            <div className={styles.monthAmount}>£{monthlyAmount}</div>
          </div>
        ))}
      </div>
      <div className={styles.timelineLabels}>
        <span>First payment: {firstDate}</span>
        <span>Final payment: {finalDate}</span>
      </div>
    </Card>
  );
}
