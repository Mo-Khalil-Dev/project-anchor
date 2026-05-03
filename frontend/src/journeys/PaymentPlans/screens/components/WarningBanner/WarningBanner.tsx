import styles from './PlanDetails.module.css';

export function WarningBanner({ title, text }: { title: string; text: string }) {
  return (
    <div className={styles.warningBanner}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.warningIcon}>
        <path d="M12 2L2 20h20L12 2z" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 9v5M12 16.5v.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div>
        <div className={styles.warningTitle}>{title}</div>
        <div className={styles.warningText}>{text}</div>
      </div>
    </div>
  );
}
