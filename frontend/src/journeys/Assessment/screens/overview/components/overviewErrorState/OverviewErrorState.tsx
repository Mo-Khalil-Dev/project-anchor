import { Button } from '@/components/core/Button';
import styles from './OverviewErrorState.module.css';

interface Props {
  error: string;
  onGoBack: () => void;
}

export function OverviewErrorState({ error, onGoBack }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Assessment Failed</div>
      <div className={styles.message}>{error}</div>
      <div className={styles.action}>
        <Button onClick={onGoBack}>Go Back</Button>
      </div>
    </div>
  );
}