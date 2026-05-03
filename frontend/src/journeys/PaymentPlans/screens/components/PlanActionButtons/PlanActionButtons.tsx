import { Button } from '@/components/core';
import styles from './PlanDetails.module.css';

export function PlanActionButtons({
  onSelect,
  onBack,
  selectText,
  variant = 'primary',
  disabled = false,
}: {
  onSelect: () => void;
  onBack: () => void;
  selectText: string;
  variant?: 'primary' | 'success' | 'danger';
  disabled?: boolean;
}) {
  return (
    <div className={styles.actions}>
      <Button variant={variant} onClick={onSelect} disabled={disabled} className={styles.fullWidth}>
        {selectText}
      </Button>
      <Button variant="secondary" onClick={onBack} className={styles.fullWidth}>
        Back to all plans
      </Button>
    </div>
  );
}
