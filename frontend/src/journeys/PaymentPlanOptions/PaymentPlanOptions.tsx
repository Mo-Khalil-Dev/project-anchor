import type { AssessmentDetailedDTO } from '../../types';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Card, Button } from '@/components/core';
import { PlanCard } from './PlanCard';
import { usePaymentPlanOptions } from './usePaymentPlanOptions';
import styles from './PaymentPlanOptions.module.css';

export function PaymentPlanOptions({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const { selectedType, setSelectedType, recommendedPlan, handleContinue, handleCompare } = usePaymentPlanOptions(assessment);

  return (
    <CustomerLayout>
      <div className={styles.page}>
        <div className={styles.heading}>
          <h1 className={styles.headingTitle}>Choose a Payment Plan</h1>
          <p className={styles.headingSubtitle}>
            All plans clear your full £{assessment.arrears} balance. We recommend Conservative — it leaves you a safety buffer each month.
          </p>
        </div>

        <Card className={styles.summaryCard}>
          {[
            ['Balance to clear', `£${assessment.arrears}`],
            ['Your disposable income', `£${assessment.disposableIncome}/month`],
            ['Hardship level', assessment.hardshipLevel],
          ].map(([k, v]) => (
            <div key={k} className={styles.summaryItem}>
              <div className={styles.summaryLabel}>{k}</div>
              <div className={styles.summaryValue}>{v}</div>
            </div>
          ))}
        </Card>

        <div className={styles.plansGrid}>
          {assessment.paymentPlans.map(p => (
            <PlanCard
              key={p.type}
              plan={p}
              buffer={assessment.disposableIncome - p.monthlyAmount}
              isSelected={selectedType === p.type}
              isRecommended={p.type === recommendedPlan}
              onSelect={setSelectedType}
            />
          ))}
        </div>

        <div className={styles.actions}>
          <Button variant="primary" onClick={handleContinue}>
            Continue with {selectedType} Plan
          </Button>
          <Button variant="secondary" onClick={handleCompare}>
            Compare in detail
          </Button>
        </div>

        <p className={styles.footer}>
          You can adjust or pause your plan at any time. <span className={styles.footerLink}>Need advice? Talk to us.</span>
        </p>
      </div>
    </CustomerLayout>
  );
}
