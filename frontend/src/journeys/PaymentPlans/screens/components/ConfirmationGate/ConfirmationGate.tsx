import { Card } from '@/components/core';
import styles from './PlanDetails.module.css';

export function ConfirmationGate({ confirmed, setConfirmed }: { confirmed: boolean; setConfirmed: (value: boolean) => void }) {
  return confirmed ? (
    <div className={styles.confirmedBanner}>⚠ You have confirmed you understand the risk. We strongly suggest speaking with our team first.</div>
  ) : (
    <Card className={styles.confirmationGate}>
      <div className={styles.gateTitle}>To proceed, please confirm you understand the risk:</div>
      <label className={styles.checkboxLabel}>
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className={styles.checkbox} />
        <span className={styles.checkboxText}>
          I understand this plan exceeds my current disposable income and may be unsustainable. I confirm I have additional income or savings to cover the difference.
        </span>
      </label>
    </Card>
  );
}
