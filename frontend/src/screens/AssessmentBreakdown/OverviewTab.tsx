import type { AssessmentDetailedDTO } from '../../types';
import { useOverviewTab } from './useOverviewTab';
import { HARDSHIP_COLORS } from '../../mocks/assessmentMockData';
import styles from './OverviewTab.module.css';

export function OverviewTab({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const { expenseComparisons, totalExpenses, totalUkAverage } = useOverviewTab(assessment);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badge} style={{ backgroundColor: HARDSHIP_COLORS[assessment.hardshipLevel] }}>
          {assessment.hardshipLevel}
        </div>
        <div className={styles.metrics}>
          <div>Disposable Income: £{assessment.disposableIncome.toLocaleString()}/month</div>
          <div>Bill Ratio: {assessment.billRatio.toFixed(1)}%</div>
        </div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Your Expenses vs UK Average</th>
            <th>Your Amount</th>
            <th>UK Average</th>
          </tr>
        </thead>
        <tbody>
          {expenseComparisons.map(comp => (
            <tr key={comp.category}>
              <td>{comp.category}</td>
              <td>£{comp.yourAmount}</td>
              <td>£{comp.ukAverage}</td>
            </tr>
          ))}
          <tr className={styles.total}>
            <td>Total</td>
            <td>£{totalExpenses}</td>
            <td>£{totalUkAverage}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
