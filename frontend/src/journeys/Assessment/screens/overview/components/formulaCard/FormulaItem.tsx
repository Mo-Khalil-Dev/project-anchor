import styles from './FormulaCard.module.css';

const fmt = (n: number) => n.toLocaleString('en-GB', { maximumFractionDigits: 0 });

interface Props { variant: 'green' | 'amber' | 'red'; label: string; value: number; }

export function FormulaItem({ variant, label, value }: Props) {
  return (
    <div className={`${styles.item} ${styles[variant]}`}>
      <div className={styles.itemLabel}>{label}</div>
      <div className={styles.itemValue}>£{fmt(value)}/mo</div>
    </div>
  );
}