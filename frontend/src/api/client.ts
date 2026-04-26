import axios, { AxiosInstance } from 'axios';
import { setupInterceptors } from './interceptors';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup interceptors for token refresh
setupInterceptors(axiosInstance);

export { axiosInstance };
export default axiosInstance;
