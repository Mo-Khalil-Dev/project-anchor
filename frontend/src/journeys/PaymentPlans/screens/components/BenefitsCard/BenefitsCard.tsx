import { Card } from '@/components/core';
import styles from './PlanDetails.module.css';

export function BenefitsCard({ title, items }: { title: string; items: Array<{ text: string; ok?: boolean }> }) {
  return (
    <Card className={styles.benefitsCard}>
      <h3 className={styles.sectionLabel}>{title}</h3>
      {items.map((item) => (
        <div key={item.text} className={styles.bulletPoint}>
          <span className={`${styles.icon} ${item.ok !== false ? styles.checkOk : styles.warning}`}>
            {item.ok !== false ? '✓' : '!'}
          </span>
          <span className={styles.text}>{item.text}</span>
        </div>
      ))}
    </Card>
  );
}
