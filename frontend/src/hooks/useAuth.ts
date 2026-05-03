import {useDispatch, useSelector} from 'react-redux';
import {useCallback} from 'react';
import type {RootState, AuthUser} from '../types';
import {setUser, setAccessToken, clearAuth, setLoading, setError} from '../store/slices/authSlice';
import {authService} from '../services/authService';

export interface UseAuthReturn {
    user: AuthUser | null;
    accessToken: string | null;
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
    const auth = useSelector((state: RootState) => state.auth);
    const {user, accessToken, isAuthenticated, isLoading, error} = auth;

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
                dispatch(setAccessToken(result.accessToken));
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
        try {
            const result = await authService.refreshToken();
            dispatch(setAccessToken(result.accessToken));
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to refresh token';
            dispatch(setError(errorMsg));
            dispatch(clearAuth());
            throw err;
        }
    }, [dispatch]);

    const logout = useCallback(
        async (allSessions: boolean = false) => {
            dispatch(setLoading(true));
            dispatch(setError(null));

            try {
                if (user) {
                    await authService.logout(user.id, allSessions);
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Failed to logout';
                dispatch(setError(errorMsg));
            } finally {
                dispatch(clearAuth());
                dispatch(setLoading(false));
            }
        },
        [dispatch, user]
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
