import { useAssessmentBreakdown } from '../../hooks/useAssessmentBreakdown';
import { OverviewTab } from './OverviewTab';
import { ExpensesTab } from './ExpensesTab';
import { IncomeStabilityTab } from './IncomeStabilityTab';
import { WhyThisHappenedTab } from './WhyThisHappenedTab';
import styles from './AssessmentBreakdown.module.css';

export function AssessmentBreakdown() {
  const { assessment, activeTab, setActiveTab, isLoading, error } = useAssessmentBreakdown();

  if (isLoading) return <div className={styles.loading}>Loading assessment...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!assessment) return <div className={styles.error}>No assessment found</div>;

  return (
    <div className={styles.container}>
      <h1>Your Hardship Assessment</h1>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'expenses' ? styles.active : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'income' ? styles.active : ''}`}
          onClick={() => setActiveTab('income')}
        >
          Income Stability
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'factors' ? styles.active : ''}`}
          onClick={() => setActiveTab('factors')}
        >
          Why This Happened
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'overview' && <OverviewTab assessment={assessment} />}
        {activeTab === 'expenses' && <ExpensesTab assessment={assessment} />}
        {activeTab === 'income' && <IncomeStabilityTab assessment={assessment} />}
        {activeTab === 'factors' && <WhyThisHappenedTab assessment={assessment} />}
      </div>
    </div>
  );
}
