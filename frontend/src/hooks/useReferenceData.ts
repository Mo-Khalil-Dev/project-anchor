import { useEffect, useState, useCallback } from 'react';
import { referenceDataService } from '../services/referenceDataService';
import type { ReferenceData } from '../types/referenceData.types';

interface UseReferenceDataState {
  data: ReferenceData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReferenceData(isAuthenticated: boolean): UseReferenceDataState {
  const [data, setData] = useState<ReferenceData | null>(null);
  const [isLoading, setIsLoading] = useState(isAuthenticated);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await referenceDataService.getReferenceData();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch reference data';
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    fetchData();

    // Auto-refetch every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
