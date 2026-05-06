import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReferenceDataContext } from '@/context/ReferenceDataContext';
import type { NextStep } from '@/types/referenceData.types';

type GuardStatus = 'checking' | 'allowed' | 'redirecting';

const NEXT_STEP_TO_ROUTE: Record<NextStep, string> = {
  'ACCOUNT_SETUP': '/account-setup',
  'ACCOUNT_SETUP_LOADING': '/account-setup',
  'BANK_CONNECTION': '/bank-connection',
  'ASSESSMENT': '/assessment',
  'ASSESSMENT_CALCULATING': '/assessment',
  'PAYMENT_PLANS': '/payment-plans',
  'DIRECT_DEBIT_SETUP': '/payment-plans/direct-debit',
  'DIRECT_DEBIT_PENDING': '/payment-plans/direct-debit/holding',
  'COMPLETE': '/assessment',
};

/**
 * useJourneyGuard
 *
 * Uses reference data's nextStep to redirect user to the correct journey page
 * if they have not completed all prior steps.
 *
 * Each page declares which routes block it via `blockedNextPages`.
 * If the backend says the user's nextStep maps to a blocked page,
 * they get redirected there immediately.
 *
 * Journey order:
 *   /account-setup → /bank-connection → /assessment → /assessment (view latest assessment)
 *
 * Usage:
 *   // Block if account setup not complete
 *   const { status } = useJourneyGuard({ blockedNextPages: ['/account-setup'] });
 *
 *   if (status === 'checking') return <Spinner />;
 *   if (status === 'redirecting') return null;
 */
export function useJourneyGuard({ blockedNextPages }: { blockedNextPages: string[] }) {
  const navigate = useNavigate();
  const { data, isLoading } = useReferenceDataContext();
  const [status, setStatus] = useState<GuardStatus>('checking');

  useEffect(() => {
    if (isLoading) return;

    if (!data) {
      setStatus('allowed');
      return;
    }

    const nextPage = NEXT_STEP_TO_ROUTE[data.nextStep];

    if (blockedNextPages.includes(nextPage)) {
      setStatus('redirecting');
      navigate(nextPage, { replace: true });
    } else {
      setStatus('allowed');
    }
  }, [data, isLoading, blockedNextPages, navigate]);

  return { status };
}
