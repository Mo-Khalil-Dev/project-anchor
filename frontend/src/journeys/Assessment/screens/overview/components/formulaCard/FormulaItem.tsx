import styles from './FormulaCard.module.css';
import { formatCurrency } from '@/utils/format';

interface Props { variant: 'green' | 'amber' | 'red'; label: string; value: number; }

export function FormulaItem({ variant, label, value }: Props) {
  return (
    <div className={`${styles.item} ${styles[variant]}`}>
      <div className={styles.itemLabel}>{label}</div>
      <div className={styles.itemValue}>£{formatCurrency(value)}/mo</div>
    </div>
  );
}