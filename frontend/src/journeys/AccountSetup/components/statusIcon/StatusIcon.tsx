import { cn } from '@/lib/cn';
import styles from './StatusIcon.module.css';

interface Props {
  variant: 'success' | 'error';
}

export function StatusIcon({ variant }: Props) {
  const role = variant === 'success' ? 'Success' : 'Error';
  return (
    <div role="img" aria-label={role} className={cn(styles.iconWrap, styles[variant])}>
      {variant === 'success' ? <SuccessGlyph /> : <ErrorGlyph />}
    </div>
  );
}

function SuccessGlyph() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <circle cx="18" cy="18" r="17" fill="oklch(51% 0.17 145)" opacity="0.15" />
      <path d="M11 18.5l5 5 9-10" stroke="oklch(51% 0.17 145)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorGlyph() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <circle cx="18" cy="18" r="17" fill="oklch(52% 0.18 25)" opacity="0.12" />
      <path d="M13 13l10 10M23 13L13 23" stroke="oklch(52% 0.18 25)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
