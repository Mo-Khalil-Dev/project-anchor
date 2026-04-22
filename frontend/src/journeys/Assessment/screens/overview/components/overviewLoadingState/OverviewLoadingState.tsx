import styles from './OverviewLoadingState.module.css';

export function OverviewLoadingState() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <p className={styles.text}>Calculating your assessment...</p>
    </div>
  );
}