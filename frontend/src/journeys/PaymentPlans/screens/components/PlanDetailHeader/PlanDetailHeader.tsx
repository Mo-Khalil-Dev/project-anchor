import styles from './PlanDetails.module.css';

export function PlanDetailHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
}
