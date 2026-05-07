import { useEffect } from 'react';
import { SpinnerScreen } from '../spinnerScreen';

interface Props {
  onAdvance: () => void;
  delayMs?: number;
}

export function RedirectState({ onAdvance, delayMs = 1500 }: Props) {
  useEffect(() => {
    const id = setTimeout(onAdvance, delayMs);
    return () => clearTimeout(id);
  }, [onAdvance, delayMs]);

  return (
    <SpinnerScreen
      label="Taking you to bank connection…"
      detail="Securely redirecting via Open Banking"
    />
  );
}
