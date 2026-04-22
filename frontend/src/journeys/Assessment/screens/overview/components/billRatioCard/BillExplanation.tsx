import { Assessment } from '@/journeys/Assessment/models/assessment';
import styles from './BillRatioCard.module.css';

interface Props { rounded: number; hardshipLevel: Assessment['hardshipLevel']; }

export function BillExplanation({ rounded, hardshipLevel }: Props) {
  return (
    <div className={styles.explanation}>
      <strong>What this means:</strong> The average household spends 5–8% of disposable income on energy bills.
      Your outstanding balance represents {rounded}% of your monthly disposable income — this qualifies as{' '}
      <strong>{hardshipLevel.toLowerCase()} financial hardship</strong> under Ofgem guidelines.
    </div>
  );
}