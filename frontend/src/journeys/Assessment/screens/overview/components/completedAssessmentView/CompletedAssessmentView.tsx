import { HardshipBadge } from '@/components/core/HardshipBadge';
import { Assessment } from '@/journeys/Assessment/models/assessment';
import { BillRatioCard } from '../billRatioCard';
import { FormulaCard } from '../formulaCard';
import { StatCardsGrid } from '../statCardsGrid';
import { AssessmentCTAs } from '.';
import styles from './CompletedAssessmentView.module.css';

interface Props {
  assessment: Assessment;
  onExplorePaymentPlans: () => void;
  onViewBreakdown: () => void;
}

export function CompletedAssessmentView({ assessment, onExplorePaymentPlans, onViewBreakdown }: Props) {
  return (
    <>
      <div className={styles.badgeRow}>
        <HardshipBadge level={assessment.hardshipLevel} />
        {/* TODO: replace hardcoded account ref + bank name with real BankConnection data once exposed by the API */}
        <span className={styles.accountInfo}>Account #BR-2847 · Barclays connected</span>
      </div>
      <StatCardsGrid monthlyIncome={assessment.monthlyIncome} monthlyExpenses={assessment.monthlyExpenses} disposableIncome={assessment.disposableIncome} />
      <BillRatioCard billRatio={assessment.billRatio} monthlyBill={assessment.monthlyBill} hardshipLevel={assessment.hardshipLevel} />
      <FormulaCard monthlyIncome={assessment.monthlyIncome} monthlyExpenses={assessment.monthlyExpenses} disposableIncome={assessment.disposableIncome} />
      <AssessmentCTAs onExplorePaymentPlans={onExplorePaymentPlans} onViewBreakdown={onViewBreakdown} />
    </>
  );
}