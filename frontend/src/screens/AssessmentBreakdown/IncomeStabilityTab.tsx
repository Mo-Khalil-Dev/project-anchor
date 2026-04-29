import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AssessmentDetailedDTO } from '../../types';
import styles from './IncomeStabilityTab.module.css';

export function IncomeStabilityTab({ assessment }: { assessment: AssessmentDetailedDTO }) {
  const data = assessment.incomeHistory.map((record) => ({
    month: record.month.split(' ')[0], // Show short month name
    amount: record.amount,
  }));

  const amounts = data.map(d => d.amount);
  const avgIncome = amounts.reduce((a, b) => a + b) / amounts.length;
  const trend = amounts[amounts.length - 1] > amounts[0] ? 'up' : 'down';

  return (
    <div className={styles.container}>
      <h3>Your Income Over 6 Months</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `£${value}`} />
          <Line type="monotone" dataKey="amount" stroke="#5b5bd6" strokeWidth={2} dot={{ fill: '#5b5bd6' }} />
        </LineChart>
      </ResponsiveContainer>
      <div className={styles.stats}>
        <p>Average: £{avgIncome.toFixed(0)}/month</p>
        <p>Trend: {trend === 'up' ? '↑ Increasing' : '↓ Decreasing'}</p>
      </div>
    </div>
  );
}
