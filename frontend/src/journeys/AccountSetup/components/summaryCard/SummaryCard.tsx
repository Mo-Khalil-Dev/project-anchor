import type { ReactNode } from 'react';
import styles from './SummaryCard.module.css';

export interface SummaryRow {
  label: string;
  value: ReactNode;
}

interface Props {
  title: string;
  rows: SummaryRow[];
}

export function SummaryCard({ title, rows }: Props) {
  return (
    <section className={styles.card} aria-label={title}>
      <p className={styles.title}>{title}</p>
      {rows.map((row) => (
        <div key={row.label} className={styles.row}>
          <span className={styles.rowLabel}>{row.label}</span>
          <span className={styles.rowValue}>{row.value}</span>
        </div>
      ))}
    </section>
  );
}
