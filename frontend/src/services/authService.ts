import { httpService } from '../api/httpService';
import { unwrap } from '../api/unwrap';
import type { AuthUser, ApiResponse } from '../types';

export interface InitiateLoginResponse {
  loginUrl: string;
  state: string;
}

export interface AuthCallbackResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface GetCurrentUserResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

class AuthService {
  async initiateLogin(): Promise<InitiateLoginResponse> {
    const response = await httpService.get<ApiResponse<InitiateLoginResponse>>(
      '/auth/initiate-login'
    );
    return unwrap(response);
  }

  async handleCallback(code: string, state: string): Promise<AuthCallbackResponse> {
    const response = await httpService.get<ApiResponse<AuthCallbackResponse>>(
      `/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
    );
    return unwrap(response);
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await httpService.get<ApiResponse<RefreshTokenResponse>>(
      '/auth/refresh'
    );
    return unwrap(response);
  }

  async logout(userId: string, allSessions?: boolean): Promise<void> {
    const response = await httpService.post<ApiResponse<void>>(
      '/auth/logout',
      { userId, allSessions }
    );
    unwrap(response);
  }

  async getCurrentUser(): Promise<GetCurrentUserResponse> {
    const response = await httpService.get<ApiResponse<GetCurrentUserResponse>>(
      '/auth/me'
    );
    return unwrap(response);
  }
}

export const authService = new AuthService();
