import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './PrimaryButton.module.css';

interface Props {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
}

export function PrimaryButton({ children, onClick, disabled, loading, type = 'button' }: Props) {
  const isInert = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isInert}
      className={cn(styles.btn, isInert && styles.btnDisabled)}
    >
      {loading && <ButtonSpinner />}
      {children}
    </button>
  );
}

function ButtonSpinner() {
  return (
    <svg className={styles.spinner} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
      <path d="M9 2 A7 7 0 0 1 16 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
