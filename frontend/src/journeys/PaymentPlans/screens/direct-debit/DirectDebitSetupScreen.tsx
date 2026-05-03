import { useSelector } from 'react-redux';
import { useAssessmentBreakdown } from '@/hooks/useAssessmentBreakdown';
import { CustomerLayout } from '@/components/layouts/CustomerLayout';
import { Button, Card } from '@/components/core';
import { useDirectDebitSetup } from './useDirectDebitSetup';
import styles from './DirectDebitSetupScreen.module.css';

export function DirectDebitSetupScreen() {
  const { assessment } = useAssessmentBreakdown();
  const selectedPlan = useSelector((state: any) => state.customer.selectedPlan);
  const { form, updateField, paymentDay, setPaymentDay, isComplete, paymentDays, handleConfirm, handleBack } = useDirectDebitSetup();

  const plan = assessment?.paymentPlans.find(p => p.type.toLowerCase() === selectedPlan);

  if (!plan || !assessment) {
    return (
      <CustomerLayout>
        <div className={styles.container}>
          <p className={styles.error}>No plan selected</p>
        </div>
      </CustomerLayout>
    );
  }

  const firstPaymentDate = new Date();
  firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
  firstPaymentDate.setDate(15);
  const dateStr = firstPaymentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const getDaySuffix = (day: number) => {
    const j = day % 10;
    const k = day % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  return (
    <CustomerLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Set Up Direct Debit</h1>
          <p className={styles.subtitle}>Your bank details are encrypted and only used to set up your payment plan.</p>
        </div>

        <div className={styles.layout}>
          {/* Left column: Form */}
          <div className={styles.leftColumn}>
            {/* Bank details form */}
            <Card className={styles.formCard}>
              <div className={styles.formField}>
                <label className={styles.label}>Account holder name</label>
                <p className={styles.hint}>As it appears on your bank account</p>
                <input
                  type="text"
                  value={form.accountHolderName}
                  onChange={e => updateField('accountHolderName', e.target.value)}
                  placeholder="Sarah Mitchell"
                  className={styles.input}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>Sort code</label>
                <p className={styles.hint}>6 digits, e.g. 12-34-56</p>
                <input
                  type="text"
                  value={form.sortCode}
                  onChange={e => updateField('sortCode', e.target.value)}
                  placeholder="20-00-00"
                  maxLength={8}
                  className={styles.input}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.label}>Account number</label>
                <p className={styles.hint}>8 digits</p>
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={e => updateField('accountNumber', e.target.value)}
                  placeholder="12345678"
                  maxLength={8}
                  className={styles.input}
                />
              </div>
            </Card>

            {/* Payment date selector */}
            <Card className={styles.paymentDateCard}>
              <label className={styles.label}>Preferred payment date</label>
              <div className={styles.dayButtons}>
                {paymentDays.map(day => (
                  <button
                    key={day}
                    onClick={() => setPaymentDay(day)}
                    className={`${styles.dayButton} ${paymentDay === day ? styles.selected : ''}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p className={styles.dayHint}>
                Payment will be taken on the {paymentDay}{getDaySuffix(paymentDay)} of each month
              </p>
            </Card>
          </div>

          {/* Right column: Summary + Guarantee */}
          <div className={styles.rightColumn}>
            {/* Summary card */}
            <Card className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Payment summary</h3>
              <div className={styles.summaryContent}>
                {[
                  ['Account name', form.accountHolderName || '—'],
                  ['Sort code', form.sortCode || '—'],
                  ['Account number', form.accountNumber || '—'],
                  ['First payment', dateStr],
                  ['Amount', `£${plan.monthlyAmount.toFixed(2)}`],
                  ['Frequency', 'Monthly'],
                  ['Duration', `${plan.duration} payments`],
                ].map(([key, value]) => (
                  <div key={key} className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{key}</span>
                    <span className={styles.summaryValue}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Guarantee box */}
            <div className={styles.guaranteeBox}>
              <span className={styles.lockIcon}>🔒</span>
              <span>
                Protected by the <strong>Direct Debit Guarantee</strong>. You have the right to cancel at any time and claim an immediate refund for any incorrect payment.
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button variant="primary" className="w-full" disabled={!isComplete} onClick={handleConfirm}>
            Confirm Direct Debit
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleBack}>
            Back
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}
