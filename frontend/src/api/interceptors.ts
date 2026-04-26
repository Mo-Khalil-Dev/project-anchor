import type { AxiosInstance } from 'axios';
import { store } from '../store';
import { setAccessToken, clearAuth } from '../store/slices/authSlice';
import { authService } from '../services/authService';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

export function setupInterceptors(axiosInstance: AxiosInstance) {
  // Request interceptor: Add token to headers
  axiosInstance.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.auth.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor: Handle 401 and refresh token
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If not 401 or already tried to refresh, reject
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      // If token refresh already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const state = store.getState();
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          store.dispatch(clearAuth());
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const result = await authService.refreshToken(refreshToken);

        // Update Redux state with new token
        store.dispatch(setAccessToken(result.accessToken));

        // Update header for original request
        originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;

        // Process queued requests with new token
        processQueue(null, result.accessToken);

        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        store.dispatch(clearAuth());
        processQueue(refreshError as Error, null);

        // Redirect to login
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }
  );
}
