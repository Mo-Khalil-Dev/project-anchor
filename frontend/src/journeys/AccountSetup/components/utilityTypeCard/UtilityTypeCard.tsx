import { cn } from '@/lib/cn';
import type { UtilityTypeDefinition } from '../../data/utilityTypes';
import styles from './UtilityTypeCard.module.css';

interface Props {
  type: UtilityTypeDefinition;
  selected: boolean;
  onSelect: () => void;
}

export function UtilityTypeCard({ type, selected, onSelect }: Props) {
  const iconColor = selected ? '#fff' : '#9ca3af';
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(styles.card, selected && styles.cardSelected)}
    >
      <span className={cn(styles.iconWrap, selected && styles.iconWrapSelected)}>
        {type.icon(iconColor)}
      </span>
      <span className={styles.body}>
        <span className={cn(styles.label, selected && styles.labelSelected)}>{type.label}</span>
        <span className={styles.description}>{type.description}</span>
      </span>
      <span className={cn(styles.radio, selected && styles.radioSelected)} aria-hidden="true">
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}
