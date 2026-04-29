import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AssessmentDetailedDTO } from '../../types';
import styles from './ExpensesTab.module.css';

export function ExpensesTab({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const data = Object.entries(assessment.expensesByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className={styles.container}>
      <h3>Monthly Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(value) => `£${value}`} />
          <Bar dataKey="amount" fill="#5b5bd6" />
        </BarChart>
      </ResponsiveContainer>
      <div className={styles.legend}>
        <p>Your spending is highest in {data[0]?.category}, followed by {data[1]?.category}.</p>
      </div>
    </div>
  );
}
