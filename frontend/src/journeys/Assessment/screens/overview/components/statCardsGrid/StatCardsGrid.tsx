import styles from './StatCardsGrid.module.css';
import { StatCard } from './StatCard';

interface Props { monthlyIncome: number; monthlyExpenses: number; disposableIncome: number; }

export function StatCardsGrid({ monthlyIncome, monthlyExpenses, disposableIncome }: Props) {
  return (
    <div className={styles.grid}>
      <StatCard variant="green" value={monthlyIncome} label="Monthly Income" sub="Average over 6 months" />
      <StatCard variant="amber" value={monthlyExpenses} label="Total Expenses" sub="Essential spending" />
      <StatCard variant="red" value={disposableIncome} label="Disposable Income" sub="After essentials" />
    </div>
  );
}