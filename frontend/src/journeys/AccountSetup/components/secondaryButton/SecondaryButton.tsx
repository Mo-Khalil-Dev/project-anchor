import type { ReactNode } from 'react';
import styles from './SecondaryButton.module.css';

interface Props {
  children: ReactNode;
  onClick: () => void;
  type?: 'button' | 'submit';
}

export function SecondaryButton({ children, onClick, type = 'button' }: Props) {
  return (
    <button type={type} onClick={onClick} className={styles.btn}>
      {children}
    </button>
  );
}
