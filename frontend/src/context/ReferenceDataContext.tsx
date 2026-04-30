import React, { ReactNode, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useReferenceData } from '../hooks/useReferenceData';
import type { ReferenceData } from '../types/referenceData.types';

interface ReferenceDataContextValue {
  data: ReferenceData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultContextValue: ReferenceDataContextValue = {
  data: null,
  isLoading: false,
  error: null,
  refetch: async () => {},
};

const ReferenceDataContext = React.createContext<ReferenceDataContextValue>(defaultContextValue);

export function ReferenceDataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const referenceData = useReferenceData(isAuthenticated);

  const contextValue = useMemo(() => {
    if (isAuthenticated) {
      return referenceData;
    } else {
      return defaultContextValue;
    }
  }, [isAuthenticated, referenceData.data, referenceData.isLoading, referenceData.error, referenceData.refetch]);

  return (
    <ReferenceDataContext.Provider value={contextValue}>
      {children}
    </ReferenceDataContext.Provider>
  );
}

export function useReferenceDataContext(): ReferenceDataContextValue {
  const context = React.useContext(ReferenceDataContext);
  return context || defaultContextValue;
}
