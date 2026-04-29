import { useState } from 'react';
import type { LinkDetails, UtilityType } from '../../types';
import { useCustomerSetup } from '@/hooks/useCustomerSetup';

interface UseLinkingStateArgs {
  onSuccess: (details: LinkDetails) => void;
  onError: (details: LinkDetails) => void;
  /** Hook for unit tests to inject a deterministic delay (default 0ms). */
  submitDelayMs?: number;
}

/**
 * Local state machine for the two-step linking flow.
 * Step 1 = utility type selection. Step 2 = postcode + account ref.
 *
 * Submission calls the backend /api/customer/setup endpoint to link the
 * authenticated user to a customer based on utility account details.
 */
export function useLinkingState({ onSuccess, onError, submitDelayMs = 0 }: UseLinkingStateArgs) {
  const [step, setStep] = useState<1 | 2>(1);
  const [utilityType, setUtilityType] = useState<UtilityType | ''>('');
  const { loading, linkCustomer } = useCustomerSetup();

  const goToDetails = () => setStep(2);
  const goBackToTypeSelection = () => setStep(1);

  const submitDetails = async (form: { postcode: string; accountRef: string }) => {
    if (!utilityType) return;

    const details: LinkDetails = { utilityType, postcode: form.postcode, accountRef: form.accountRef };

    // Convert frontend utility type (lowercase) to backend format (capitalized)
    // TODO: Replace with an explicit map to remove the case-sensitivity assumption:
    //   const MAP = { water: 'Water', gas: 'Gas', electricity: 'Electricity' } as const;
    //   const backendUtilityType = MAP[utilityType];
    const backendUtilityType = utilityType.charAt(0).toUpperCase() + utilityType.slice(1);

    // Error is returned directly in the result — no stale React state risk
    const { data, error } = await linkCustomer({
      utilityType: backendUtilityType as 'Electricity' | 'Gas' | 'Water',
      postcode: form.postcode,
      accountReference: form.accountRef,
    });

    if (data) {
      if (submitDelayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, submitDelayMs));
      }
      onSuccess(details);
    } else {
      onError({ ...details, errorMessage: error ?? undefined });
    }
  };

  return {
    step,
    utilityType,
    loading,
    setUtilityType,
    goToDetails,
    goBackToTypeSelection,
    submitDetails,
  };
}
