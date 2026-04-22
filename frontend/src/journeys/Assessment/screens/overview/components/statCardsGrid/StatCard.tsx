import styles from './StatCardsGrid.module.css';

const fmt = (n: number) => n.toLocaleString('en-GB', { maximumFractionDigits: 0 });

interface Props { variant: 'green' | 'amber' | 'red'; value: number; label: string; sub: string; }

export function StatCard({ variant, value, label, sub }: Props) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.value}>£{fmt(value)}</div>
      <div className={styles.label}>{label}</div>
      <div className={styles.sub}>{sub}</div>
    </div>
  );
}