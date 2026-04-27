import styles from './LinearProgressBar.module.css';

interface Props {
  progress: number;
}

export function LinearProgressBar({ progress }: Props) {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.fill} style={{ width: `${clamped}%` }} data-testid="progress-fill" />
    </div>
  );
}
