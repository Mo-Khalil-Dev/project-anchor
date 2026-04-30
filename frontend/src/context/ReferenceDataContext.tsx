import React, { ReactNode, useState, useEffect } from 'react';
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
  const [contextValue, setContextValue] = useState<ReferenceDataContextValue>(defaultContextValue);

  useEffect(() => {
    if (isAuthenticated) {
      setContextValue(referenceData);
    } else {
      setContextValue(defaultContextValue);
    }
  }, [isAuthenticated, referenceData]);

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
