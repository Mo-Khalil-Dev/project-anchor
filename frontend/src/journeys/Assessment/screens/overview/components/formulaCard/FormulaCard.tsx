import styles from './FormulaCard.module.css';
import { FormulaItem } from '.';

interface Props { monthlyIncome: number; monthlyExpenses: number; disposableIncome: number; }

export function FormulaCard({ monthlyIncome, monthlyExpenses, disposableIncome }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>How we calculated this</div>
      <div className={styles.row}>
        <FormulaItem variant="green" label="Income" value={monthlyIncome} />
        <span className={styles.op}>−</span>
        <FormulaItem variant="amber" label="Essentials" value={monthlyExpenses} />
        <span className={styles.op}>=</span>
        <FormulaItem variant="red" label="Disposable" value={disposableIncome} />
      </div>
    </div>
  );
}