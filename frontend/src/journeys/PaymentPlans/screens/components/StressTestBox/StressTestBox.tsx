import { Card } from '@/components/core';
import styles from './PlanDetails.module.css';

export function StressTestBox({ children, color }: { children: string; color: 'conservative' | 'balanced' | 'aggressive' }) {
  const colorClass = color === 'conservative' ? styles.stressGreen : color === 'balanced' ? styles.stressAmber : styles.stressRed;

  return (
    <Card className={`${styles.stressTest} ${colorClass}`}>
      {children}
    </Card>
  );
}
