import styles from './BillRatioCard.module.css';
import { formatCurrency } from '@/utils/format';

interface Props { rounded: number; monthlyBill: number; }

export function BillRatioHeader({ rounded, monthlyBill }: Props) {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <div className={styles.label}>Bill as % of Disposable Income</div>
        <div className={styles.ratioContainer}>
          <span className={styles.ratio}>{rounded}%</span>
          <span className={styles.ratioSub}>of your disposable income</span>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.balanceLabel}>Your balance</div>
        <div className={styles.balance}>£{formatCurrency(monthlyBill)}</div>
      </div>
    </div>
  );
}