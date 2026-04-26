import { ReactNode } from 'react';
import { useInitializeAuth } from '../hooks/useInitializeAuth';

interface AppInitializerProps {
  children: ReactNode;
}

/**
 * Component that initializes app-level state (auth, etc.) on mount.
 * Wraps the entire app to ensure initialization happens before routing.
 */
export function AppInitializer({ children }: AppInitializerProps) {
  const isInitialized = useInitializeAuth();

  // Show loading state while initializing auth
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
