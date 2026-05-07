import { useEffect } from 'react';
import { SpinnerScreen } from '../spinnerScreen';

interface Props {
  onAdvance: () => void;
  delayMs?: number;
}

export function CheckingState({ onAdvance, delayMs = 2200 }: Props) {
  useEffect(() => {
    const id = setTimeout(onAdvance, delayMs);
    return () => clearTimeout(id);
  }, [onAdvance, delayMs]);

  return <SpinnerScreen label="Checking your account…" detail="Looking up linked utility accounts" />;
}
