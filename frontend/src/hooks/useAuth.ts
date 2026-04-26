import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import type { RootState } from '../types';
import { setUser, setTokens, setAccessToken, clearAuth, setLoading, setError } from '../store/slices/authSlice';
import { authService } from '../services/authService';

export interface UseAuthReturn {
  user: ReturnType<typeof useSelector> | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initiateLogin: () => Promise<{ loginUrl: string; state: string }>;
  handleCallback: (code: string, state: string) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  logout: (allSessions?: boolean) => Promise<void>;
  getCurrentUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const dispatch = useDispatch();
  const { user, accessToken, refreshToken, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const initiateLogin = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const result = await authService.initiateLogin();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initiate login';
      dispatch(setError(errorMsg));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const handleCallback = useCallback(
    async (code: string, state: string) => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const result = await authService.handleCallback(code, state);
        dispatch(setUser(result.user));
        dispatch(setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken }));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to handle callback';
        dispatch(setError(errorMsg));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      dispatch(setError('No refresh token available'));
      return;
    }

    try {
      const result = await authService.refreshToken(refreshToken);
      dispatch(setAccessToken(result.accessToken));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh token';
      dispatch(setError(errorMsg));
      dispatch(clearAuth());
      throw err;
    }
  }, [dispatch, refreshToken]);

  const logout = useCallback(
    async (allSessions: boolean = false) => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        if (user) {
          await authService.logout(user.id, refreshToken || undefined, allSessions);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to logout';
        dispatch(setError(errorMsg));
      } finally {
        dispatch(clearAuth());
        dispatch(setLoading(false));
      }
    },
    [dispatch, user, refreshToken]
  );

  const getCurrentUser = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const userData = await authService.getCurrentUser();
      dispatch(setUser(userData));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get current user';
      dispatch(setError(errorMsg));
      dispatch(clearAuth());
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    initiateLogin,
    handleCallback,
    refreshAccessToken,
    logout,
    getCurrentUser,
  };
}
