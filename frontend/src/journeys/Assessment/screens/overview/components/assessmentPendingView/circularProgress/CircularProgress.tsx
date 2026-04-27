import styles from './CircularProgress.module.css';

interface Props {
  progress: number;
}

export function CircularProgress({ progress }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <div className={styles.wrap} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <svg className={styles.svg} viewBox="0 0 80 80" aria-hidden="true">
        <circle className={styles.track} cx="40" cy="40" r="34" />
        <circle className={styles.arc} cx="40" cy="40" r="34" strokeDasharray="60 154" />
      </svg>
      <span className={styles.label}>{clamped}%</span>
    </div>
  );
}
