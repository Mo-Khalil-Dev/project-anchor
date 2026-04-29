import { useState } from 'react';
import type { AssessmentDetailedDTO, PaymentPlanDTO } from '../../types';
import styles from './PaymentPlanOptions.module.css';

export function PaymentPlanOptions({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      <h1>Choose Your Payment Plan</h1>
      <p className={styles.subtitle}>Select a plan that works for your financial situation</p>

      <div className={styles.plans}>
        {assessment.paymentPlans.map((plan) => (
          <PlanCard
            key={plan.type}
            plan={plan}
            isSelected={selectedType === plan.type}
            onSelect={setSelectedType}
          />
        ))}
      </div>

      {selectedType && (
        <div className={styles.actions}>
          <button className={styles.confirmBtn}>Confirm {selectedType} Plan</button>
        </div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: PaymentPlanDTO;
  isSelected: boolean;
  onSelect: (type: string) => void;
}) {
  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(plan.type)}
    >
      <h3>{plan.type}</h3>
      <div className={styles.amount}>£{plan.monthlyAmount}/month</div>
      <div className={styles.details}>
        <p>Duration: {plan.duration} months</p>
        <p>Total: £{plan.totalRepayment.toLocaleString()}</p>
      </div>
      <div className={`${styles.badge} ${styles[plan.sustainability.toLowerCase()]}`}>
        {plan.sustainability} Sustainability
      </div>
    </div>
  );
}
