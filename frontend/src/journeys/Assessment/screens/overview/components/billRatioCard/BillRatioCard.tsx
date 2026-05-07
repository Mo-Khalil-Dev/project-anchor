import { Assessment } from '@/journeys/Assessment/models/assessment';
import styles from './BillRatioCard.module.css';
import { BenchmarkBar } from '.';
import { BillExplanation } from '.';
import { BillRatioHeader } from '.';

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