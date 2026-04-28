import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { setBankJourneyState } from '@/store/slices/customerSlice';
import { useBankConnection } from './hooks/useBankConnection';
import { useJourneyGuard } from '@/hooks/useJourneyGuard';
import { Intro } from './screens/Intro';
import { Privacy } from './screens/Privacy';
import { YouAreBeingDirected } from './screens/YouAreBeingDirected';
import { Connecting } from './screens/Connecting';
import { Success } from './screens/Success';
import { Error } from './screens/Error';

export function BankConnectionRoot() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const journeyState = useAppSelector((s) => s.customer.bankJourneyState);
  const { handleCallback } = useBankConnection();
  const callbackProcessedRef = useRef(false);

  // Redirect to account setup if customer has not been linked yet
  const { status: guardStatus } = useJourneyGuard({
    blockedNextPages: ['/account-setup'],
  });

  // Handle OAuth callback - extract expense_check_id and state from Tink redirect
  useEffect(() => {
    const expenseCheckId = searchParams.get('expense_check_id') || searchParams.get('expense_check_report_id');
    const state = searchParams.get('state');

    // Only process callback once per URL change
    if (expenseCheckId && state && !callbackProcessedRef.current) {
      callbackProcessedRef.current = true;
      dispatch(setBankJourneyState('connecting'));
      handleCallback(expenseCheckId, state).catch(() => {
        // Error is handled by the hook and sets state to 'error'
      });
    }
  }, [searchParams, dispatch, handleCallback]);

  // Guard: show spinner while checking, render nothing while redirecting
  if (guardStatus === 'checking') return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
    </div>
  );
  if (guardStatus === 'redirecting') return null;

  // Default to 'intro' if no state set
  if (!journeyState) {
    return <Intro />;
  }

  switch (journeyState) {
    case 'intro':
      return <Intro />;
    case 'privacy':
      return <Privacy />;
    case 'youAreBeingDirected':
      return <YouAreBeingDirected />;
    case 'connecting':
      return <Connecting />;
    case 'success':
      return <Success />;
    case 'error':
      return <Error />;
    default:
      return <Intro />;
  }
}
