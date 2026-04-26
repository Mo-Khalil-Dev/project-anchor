import { httpService } from '../api/httpService';
import type { AuthUser } from '../types';

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
    const response = await httpService.get<InitiateLoginResponse>(
      '/auth/initiate-login'
    );
    return response;
  }

  async handleCallback(code: string, state: string): Promise<AuthCallbackResponse> {
    const response = await httpService.get<AuthCallbackResponse>(
      `/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
    );
    return response;
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await httpService.post<RefreshTokenResponse>(
      '/auth/refresh',
      {}
    );
    return response;
  }

  async logout(userId: string, allSessions?: boolean): Promise<void> {
    await httpService.post('/auth/logout', {
      userId,
      allSessions,
    });
  }

  async getCurrentUser(): Promise<GetCurrentUserResponse> {
    const response = await httpService.get<GetCurrentUserResponse>('/auth/me');
    return response;
  }
}

export const authService = new AuthService();
