import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../types';
import { setAccessToken, setLoading } from '../store/slices/authSlice';
import { authService } from '../services/authService';

/**
 * Hook that initializes auth on app mount by checking for refresh token
 * and restoring the access token if available.
 */
export function useInitializeAuth(): boolean {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const hasAccessToken = useSelector((state: RootState) => state.auth.accessToken !== null);
  const initializationAttempted = useRef(false);

  useEffect(() => {
    // Only attempt initialization once
    if (initializationAttempted.current) {
      return;
    }

    initializationAttempted.current = true;

    const initializeAuth = async () => {
      try {
        dispatch(setLoading(true));
        // Try to refresh the access token using the refresh token cookie
        const result = await authService.refreshToken();
        dispatch(setAccessToken(result.accessToken));
      } catch (err) {
        // No valid refresh token or refresh failed - user is not authenticated
        // Don't set error, just remain logged out
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Return true if we have a token OR if we've finished loading (no token available)
  return hasAccessToken || !isLoading;
}
