import { BridgeLogo } from '@/components/core/icons';
import styles from './SpinnerScreen.module.css';

interface Props {
  label: string;
  detail: string;
  showWordmark?: boolean;
}

export function SpinnerScreen({ label, detail, showWordmark = false }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.logoRow}>
        <BridgeLogo />
        {showWordmark && <span className={styles.wordmark}>Bridge</span>}
      </div>
      <div className={styles.spinnerGroup}>
        <SpinnerArc />
        <p className={styles.label}>{label}</p>
        <p className={styles.detail}>{detail}</p>
      </div>
    </div>
  );
}

function SpinnerArc() {
  return (
    <svg className={styles.spinner} width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <circle cx="18" cy="18" r="15" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
      <path d="M18 3 A15 15 0 0 1 33 18" stroke="oklch(56% 0.14 200)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
