import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './InputField.module.css';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  error?: string | null;
  icon?: ReactNode;
  autoFocus?: boolean;
  id?: string;
}

export function InputField({ label, value, onChange, type = 'text', placeholder, hint, error, icon, autoFocus, id }: Props) {
  const [focused, setFocused] = useState(false);
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>{label}</label>
      <div className={styles.inputWrap}>
        {icon && <span className={cn(styles.iconLeft, focused && styles.iconLeftFocused)}>{icon}</span>}
        <input
          id={inputId}
          type={type}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(styles.input, icon && styles.inputWithIcon, error && styles.inputError)}
        />
      </div>
      {error && <p className={styles.error} role="alert"><InlineErrorIcon />{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}

function InlineErrorIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.5 3.5v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="6.5" cy="9.5" r="0.7" fill="currentColor" />
    </svg>
  );
}
