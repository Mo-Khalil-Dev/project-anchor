import styles from './BillRatioCard.module.css';

interface Props { rounded: number; }

export function BenchmarkBar({ rounded }: Props) {
  const markerPosition = Math.min(Math.max(rounded, 0), 100);

  return (
    <div className={styles.benchmarkSection}>
      <div className={styles.benchmarkLabels}>
        <span>0%</span>
        <span>Benchmark: 5–8%</span>
        <span>Your ratio: {rounded}%</span>
      </div>
      <div className={styles.benchmarkBar}>
        <div className={styles.benchmarkGradient} />
        <div className={styles.benchmarkMarkerLeft} />
        <div className={styles.benchmarkMarkerRight} style={{ left: `${markerPosition}%` }}>You</div>
      </div>
    </div>
  );
}