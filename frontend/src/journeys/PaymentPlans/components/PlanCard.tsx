import type { PaymentPlanDTO } from '../../../types';
import { Button, SustBadge } from '@/components/core';
import { PROS, COLORS } from '@/journeys/PaymentPlans/screens/options/usePaymentPlanOptions';
import styles from '@/journeys/PaymentPlans/screens/options/PaymentPlanOptions.module.css';

export function PlanCard({
  plan,
  buffer,
  isSelected,
  isRecommended,
  onSelect,
}: {
  plan: PaymentPlanDTO;
  buffer: number;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: (type: string) => void;
}) {
  const c = COLORS[plan.type];
  const warning = plan.type === 'Aggressive'
    ? 'Monthly payment exceeds your disposable income. High risk of missing payments.'
    : plan.type === 'Balanced'
    ? 'If an unexpected expense arises, you may struggle to make a payment.'
    : null;

  return (
    <div
      onClick={() => onSelect(plan.type)}
      className={`${styles.planCard} ${isSelected ? styles.selected : styles.unselected}`}
      style={{ '--ring-color': c.ring } as any}
    >
      {isRecommended && <div className={styles.recommendedBadge}>★ Recommended</div>}

      <div className={styles.header}>
        <div className={styles.planType}>{plan.type}</div>
        <div className={styles.price}>
          <span className={`${styles.amount} ${c.text}`}>£{plan.monthlyAmount}</span>
          <span className={styles.period}>/month</span>
        </div>
      </div>

      <div className={styles.details}>
        {[
          ['Duration', `${plan.duration} months`],
          ['Total paid', `£${plan.totalRepayment.toLocaleString()}`],
          ['Monthly buffer', buffer >= 0 ? `£${buffer}` : 'Over budget'],
        ].map(([k, v]) => (
          <div key={k} className={styles.detailRow}>
            <span className={styles.label}>{k}</span>
            <span className={k === 'Monthly buffer' && buffer < 0 ? styles.negative : styles.value}>{v}</span>
          </div>
        ))}
      </div>

      <SustBadge level={plan.sustainability} />

      <div className={styles.pros}>
        {(PROS[plan.type] || []).map(p => (
          <div key={p} className={styles.proItem}>
            <span className={`${styles.bullet} ${c.text}`}>·</span>
            <span className={styles.proText}>{p}</span>
          </div>
        ))}
      </div>

      {warning && <div className={styles.warning}>⚠ {warning}</div>}

      <div className={styles.buttonContainer}>
        <Button variant={isSelected ? 'primary' : 'ghost'} size="sm" className="w-full">
          {isSelected ? '✓ Selected — Continue' : 'Select This Plan'}
        </Button>
      </div>
    </div>
  );
}
