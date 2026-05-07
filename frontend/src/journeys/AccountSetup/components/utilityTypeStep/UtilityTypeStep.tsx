import { UTILITY_TYPES } from '../../data/utilityTypes';
import type { UtilityType } from '../../types';
import { PrimaryButton } from '../primaryButton';
import { UtilityTypeCard } from '../utilityTypeCard';
import styles from './UtilityTypeStep.module.css';

interface Props {
  selectedType: UtilityType | '';
  onSelectType: (type: UtilityType) => void;
  onContinue: () => void;
}

export function UtilityTypeStep({ selectedType, onSelectType, onContinue }: Props) {
  return (
    <>
      <UtilityTypeStepHeader />
      <div>
        <p className={styles.cardsLabel}>What type of utility account?</p>
        <div className={styles.cards}>
          {UTILITY_TYPES.map((t) => (
            <UtilityTypeCard key={t.id} type={t} selected={selectedType === t.id} onSelect={() => onSelectType(t.id)} />
          ))}
        </div>
      </div>
      <PrimaryButton onClick={onContinue} disabled={!selectedType}>Continue</PrimaryButton>
      <PrivacyFooter />
    </>
  );
}

function UtilityTypeStepHeader() {
  return (
    <div className={styles.section}>
      <span className={styles.actionPill}>
        <ActionPillIcon />
        Action required
      </span>
      <h1 className={styles.title}>Link your utility account</h1>
      <p className={styles.subtitle}>To get started, we need to connect your utility account so we can assess your situation accurately. This takes less than a minute.</p>
    </div>
  );
}

function ActionPillIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 3.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="6" cy="8.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function PrivacyFooter() {
  return (
    <p className={styles.footer}>
      <LockIcon />
      Your data is encrypted and never shared with third parties
    </p>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="1" y="4" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.5 4V3a2.5 2.5 0 015 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
