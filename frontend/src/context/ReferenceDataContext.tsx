import React, { ReactNode } from 'react';
import { useReferenceData } from '../hooks/useReferenceData';
import type { ReferenceData } from '../types/referenceData.types';

interface ReferenceDataContextValue {
  data: ReferenceData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ReferenceDataContext = React.createContext<ReferenceDataContextValue | undefined>(undefined);

export function ReferenceDataProvider({ children }: { children: ReactNode }) {
  const referenceData = useReferenceData();

  return (
    <ReferenceDataContext.Provider value={referenceData}>
      {children}
    </ReferenceDataContext.Provider>
  );
}

export function useReferenceDataContext(): ReferenceDataContextValue {
  const context = React.useContext(ReferenceDataContext);
  if (context === undefined) {
    throw new Error('useReferenceDataContext must be used within ReferenceDataProvider');
  }
  return context;
}
