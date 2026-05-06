import { useEffect, useState } from 'react';
import { useReferenceDataContext } from '@/context/ReferenceDataContext';

interface PollResult {
  mandateStatus: 'PENDING' | 'CREATED' | 'ACTIVE' | 'FAILED' | 'CANCELLED' | null;
  isPolling: boolean;
  error: string | null;
}

const POLL_INTERVAL_MS = 5000; // Poll every 5 seconds
const MAX_POLL_DURATION_MS = 5 * 60 * 1000; // Stop polling after 5 minutes

export function useMandatePolling(shouldPoll: boolean): PollResult {
  const { data: referenceData, error: contextError, refetch } = useReferenceDataContext();
  const [mandateStatus, setMandateStatus] = useState<'PENDING' | 'CREATED' | 'ACTIVE' | 'FAILED' | 'CANCELLED' | null>(null);
  const [isPolling, setIsPolling] = useState(shouldPoll);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  // Set error from context if one occurs
  useEffect(() => {
    if (contextError) {
      setError(contextError);
    }
  }, [contextError]);

  // Sync mandate status from context data
  useEffect(() => {
    if (referenceData?.mandate) {
      setMandateStatus(referenceData.mandate.status as 'PENDING' | 'CREATED' | 'ACTIVE' | 'FAILED' | 'CANCELLED');

      // Stop polling once mandate is CREATED or ACTIVE
      if (referenceData.mandate.status === 'CREATED' || referenceData.mandate.status === 'ACTIVE') {
        setIsPolling(false);
      }
    }
  }, [referenceData?.mandate]);

  // Poll every 5 seconds
  useEffect(() => {
    if (!shouldPoll || !isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        // Check if we've exceeded max poll duration
        if (Date.now() - startTime > MAX_POLL_DURATION_MS) {
          setIsPolling(false);
          setError('Polling timeout: mandate confirmation took too long');
          return;
        }

        await refetch();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to check mandate status';
        setError(message);
        setIsPolling(false);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(pollInterval);
  }, [shouldPoll, isPolling, startTime, refetch]);

  return {
    mandateStatus,
    isPolling,
    error,
  };
}
