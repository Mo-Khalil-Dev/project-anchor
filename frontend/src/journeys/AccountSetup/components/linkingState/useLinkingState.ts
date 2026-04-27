import { useState } from 'react';
import type { LinkDetails, UtilityType } from '../../types';

interface UseLinkingStateArgs {
  onSuccess: (details: LinkDetails) => void;
  onError: (details: LinkDetails) => void;
  /** Hook for unit tests to inject a deterministic delay (default 2000ms). */
  submitDelayMs?: number;
}

/**
 * Local state machine for the two-step linking flow.
 * Step 1 = utility type selection. Step 2 = postcode + account ref.
 *
 * Submission is currently stubbed (per design): refs starting with "ERR" route
 * to the error state, anything else routes to success. Replace with a real
 * service call when the backend endpoint is wired up.
 */
export function useLinkingState({ onSuccess, onError, submitDelayMs = 2000 }: UseLinkingStateArgs) {
  const [step, setStep] = useState<1 | 2>(1);
  const [utilityType, setUtilityType] = useState<UtilityType | ''>('');
  const [loading, setLoading] = useState(false);

  const goToDetails = () => setStep(2);
  const goBackToTypeSelection = () => setStep(1);

  const submitDetails = (form: { postcode: string; accountRef: string }) => {
    if (!utilityType) return;
    setLoading(true);
    const willFail = form.accountRef.trim().toUpperCase().startsWith('ERR');
    const details: LinkDetails = { utilityType, postcode: form.postcode, accountRef: form.accountRef };
    setTimeout(() => {
      setLoading(false);
      if (willFail) onError(details);
      else onSuccess(details);
    }, submitDelayMs);
  };

  return { step, utilityType, loading, setUtilityType, goToDetails, goBackToTypeSelection, submitDetails };
}
