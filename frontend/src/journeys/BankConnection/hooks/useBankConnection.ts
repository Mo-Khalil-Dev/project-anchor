import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setBankJourneyState,
  setBankConnectionData,
  setBankError,
} from '@/store/slices/customerSlice';
import { bankConnectionService } from '@/services/bankConnectionService';

export function useBankConnection() {
  const dispatch = useAppDispatch();
  const journeyState = useAppSelector((s) => s.customer.bankJourneyState);
  const connectionData = useAppSelector((s) => s.customer.bankConnectionData);
  const error = useAppSelector((s) => s.customer.bankError);

  const initiateBank = useCallback(async () => {
    try {
      dispatch(setBankError(undefined));
      const response = await bankConnectionService.initiate();
      dispatch(
        setBankConnectionData({
          authUrl: response.authUrl,
          state: response.state,
        })
      );
      dispatch(setBankJourneyState('youAreBeingDirected'));
      return response;
    } catch (err: any) {
      const errorData = {
        code: err.response?.status?.toString() || 'UNKNOWN',
        message: err.message || 'Failed to initiate bank connection',
        timestamp: new Date().toISOString(),
      };
      dispatch(setBankError(errorData));
      dispatch(setBankJourneyState('error'));
      throw err;
    }
  }, [dispatch]);

  const handleCallback = useCallback(async (expenseCheckId: string, state: string) => {
    try {
      dispatch(setBankError(undefined));
      const response = await bankConnectionService.callback(expenseCheckId, state);
      dispatch(
        setBankConnectionData({
          connectionId: response.connectionId,
          totalIncome: response.totalIncome,
          totalExpenses: response.totalExpenses,
          assessmentId: response.assessmentId,
          incomeBreakdown: response.incomeBreakdown,
          expenseBreakdown: response.expenseBreakdown,
          expenseCheckReportId: expenseCheckId,
        })
      );
      dispatch(setBankJourneyState('success'));
      return response;
    } catch (err: any) {
      const errorData = {
        code: err.response?.status?.toString() || 'CALLBACK_ERROR',
        message: err.message || 'Failed to process bank connection callback',
        timestamp: new Date().toISOString(),
      };
      dispatch(setBankError(errorData));
      dispatch(setBankJourneyState('error'));
      throw err;
    }
  }, [dispatch]);

  return {
    journeyState,
    connectionData,
    error,
    initiateBank,
    handleCallback,
  };
}
