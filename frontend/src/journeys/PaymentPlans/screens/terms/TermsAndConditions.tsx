import { useSelector } from 'react-redux';
import type { AssessmentDetailedDTO } from '@/types';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Button, Card } from '@/components/core';
import { useTermsAndConditions } from './useTermsAndConditions';
import styles from './TermsAndConditions.module.css';

interface TermsAndConditionsProps {
  assessment: AssessmentDetailedDTO;
}

const TERMS_SECTIONS = [
  {
    heading: 'What you\'re agreeing to',
    items: [
      'You will pay on the 15th of each month, starting next month.',
      'This plan runs for the agreed duration and clears your full balance.',
      'There is no interest added to your balance while the plan is active.',
    ],
  },
  {
    heading: 'If you miss a payment',
    items: [
      'We will contact you — we will not immediately report to credit agencies.',
      'You can reschedule up to 2 payments per year without penalty.',
      'After 2 missed payments without contact, the plan may be reviewed.',
    ],
  },
  {
    heading: 'Your rights',
    items: [
      'You can pause the plan at any time by calling 0800 000 0000.',
      'You can pay off the balance early at any time — no early repayment fee.',
      'You can request a reassessment if your financial situation changes.',
      'You can cancel within 14 days for a full refund of any payments made.',
    ],
  },
  {
    heading: 'Your data',
    items: [
      'Bank transaction data is stored securely and deleted after 3 years.',
      'Your data is not sold to third parties.',
      'You can request deletion under GDPR at any time.',
    ],
  },
];

export function TermsAndConditions({ assessment }: TermsAndConditionsProps) {
  const selectedPlan = useSelector((state: any) => state.customer.selectedPlan);
  console.log('[DEBUG] TermsAndConditions - selectedPlan from Redux:', selectedPlan);
  const { agreed, setAgreed, handleConfirm, handleBack } = useTermsAndConditions();

  const plan = assessment.paymentPlans.find(p => p.type.toLowerCase() === selectedPlan);

  if (!plan) {
    return (
      <CustomerLayout>
        <div className={styles.container}>
          <p className={styles.noplan}>No plan selected</p>
        </div>
      </CustomerLayout>
    );
  }

  const firstPaymentDate = new Date();
  firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
  firstPaymentDate.setDate(15);
  const dateStr = firstPaymentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <CustomerLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Plan Agreement</h1>
          <p className={styles.subtitle}>Please read these terms — they're written in plain English, not legal jargon.</p>
        </div>
        {/* Plan summary */}
        <Card className={styles.summaryCard}>
          <div className={styles.summaryGrid}>
            {[
              ['Plan', plan.type],
              ['Monthly payment', `£${plan.monthlyAmount}`],
              ['Duration', `${plan.duration} months`],
              ['Total', `£${plan.totalRepayment}`],
              ['First payment', dateStr],
            ].map(([label, value]) => (
              <div key={label} className={styles.summaryItem}>
                <div className={styles.summaryLabel}>{label}</div>
                <div className={styles.summaryValue}>{value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Terms sections */}
        {TERMS_SECTIONS.map(section => (
          <Card key={section.heading} className={styles.termsCard}>
            <h3 className={styles.sectionHeading}>{section.heading}</h3>
            {section.items.map(item => (
              <div key={item} className={styles.termItem}>
                <span className={styles.bullet} />
                <span className={styles.termText}>{item}</span>
              </div>
            ))}
          </Card>
        ))}

        {/* Acceptance checkbox */}
        <Card className={styles.acceptanceCard}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxText}>
              <div className={styles.checkboxTitle}>I accept this payment plan</div>
              <div className={styles.checkboxDescription}>
                I have read and understood the terms above. I agree to pay £{plan.monthlyAmount}/month starting {dateStr} and understand my rights.
              </div>
            </div>
          </label>
        </Card>

        {/* Actions */}
        <div className={styles.actions}>
          <Button variant="primary" className="w-full" disabled={!agreed} onClick={handleConfirm}>
            Continue to Payment Setup
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleBack}>
            Go Back
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}
