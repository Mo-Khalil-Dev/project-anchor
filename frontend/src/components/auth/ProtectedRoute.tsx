import { ReactNode, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setAccessToken, setLoading } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';

export interface ProtectedRouteProps {
  children?: ReactNode;
  requiredRole?: 'customer' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const dispatch = useDispatch();
  const [restoreAttempted, setRestoreAttempted] = useState(false);

  // Try to restore auth from refresh token on first load
  useEffect(() => {
    if (isAuthenticated) {
      setRestoreAttempted(true);
      return;
    }

    const restoreAuth = async () => {
      dispatch(setLoading(true));
      try {
        const result = await authService.refreshToken();
        dispatch(setAccessToken(result.accessToken));
      } catch {
        // Refresh failed, user not authenticated
      } finally {
        dispatch(setLoading(false));
        setRestoreAttempted(true);
      }
    };

    restoreAuth();
  }, []); // Run once on mount

  // Wait for the initial restore attempt before deciding to redirect
  if (!restoreAttempted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children || <Outlet />}</>;
}
