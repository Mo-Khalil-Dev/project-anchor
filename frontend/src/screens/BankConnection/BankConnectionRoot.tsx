import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { setBankJourneyState } from '@/store/slices/customerSlice';
import { useBankConnection } from './hooks/useBankConnection';
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

  // Handle OAuth callback
  useEffect(() => {
    const expenseCheckReportId = searchParams.get('expense_check_report_id');

    if (expenseCheckReportId && journeyState !== 'connecting') {
      dispatch(setBankJourneyState('connecting'));
      handleCallback(expenseCheckReportId).catch(() => {
        // Error is handled by the hook and sets state to 'error'
      });
    }
  }, [searchParams, journeyState, dispatch, handleCallback]);

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
