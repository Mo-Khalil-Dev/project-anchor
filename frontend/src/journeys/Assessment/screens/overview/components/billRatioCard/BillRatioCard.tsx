import { Assessment } from '@/journeys/Assessment/models/assessment';
import styles from './BillRatioCard.module.css';
import { BenchmarkBar } from './BenchmarkBar';
import { BillExplanation } from './BillExplanation';
import { BillRatioHeader } from './BillRatioHeader';

interface Props {
  billRatio: number;
  monthlyBill: number;
  hardshipLevel: Assessment['hardshipLevel'];
}

export function BillRatioCard({ billRatio, monthlyBill, hardshipLevel }: Props) {
  const rounded = Math.round(billRatio);
  return (
    <div className={styles.card}>
      <BillRatioHeader rounded={rounded} monthlyBill={monthlyBill} />
      <BenchmarkBar rounded={rounded} />
      <BillExplanation rounded={rounded} hardshipLevel={hardshipLevel} />
    </div>
  );
}