import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { AppConfig } from '../../../../shared/config/config.types';
import type { AuthTokens, AuthUser } from '../../../types/auth.types';
import {
  InvalidTokenError,
  InvalidStateError,
  AuthenticationError,
} from '../../../application/errors';
import { IAuthProvider } from '@/features/auth/application/services/IAuthProvider';

export class MockAuthProvider implements IAuthProvider {
  private config: AppConfig;
  private stateStore: Map<string, { expiresAt: Date; redirectUri: string }> = new Map();

  constructor(config: AppConfig) {
    this.config = config;
  }

  async initiateLogin(redirectUri: string): Promise<{ loginUrl: string; state: string }> {
    const state = crypto.randomBytes(16).toString('hex');
    const stateExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    this.stateStore.set(state, { expiresAt: stateExpiry, redirectUri });

    const loginUrl = `${this.config.server.backendUrl}/api/auth/mock-login?state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return { loginUrl, state };
  }

  async handleCallback(
    code: string,
    state: string,
    redirectUri: string
  ): Promise<AuthTokens & { user: AuthUser }> {
    // Special case: 'mock' state bypasses state validation (development shortcut only)
    // Disabled in production to prevent auth bypass attacks
    const isDirectMockLogin = state === 'mock' && process.env.NODE_ENV !== 'production';

    if (!isDirectMockLogin) {
      const stateData = this.stateStore.get(state);

      if (!stateData) {
        throw new InvalidStateError('Invalid or expired state');
      }

      if (stateData.expiresAt < new Date()) {
        this.stateStore.delete(state);
        throw new InvalidStateError('State has expired');
      }

      if (stateData.redirectUri !== redirectUri) {
        throw new InvalidStateError('Redirect URI mismatch');
      }

      this.stateStore.delete(state);
    }

    // In mock provider, the "code" is just the email in base64
    let email: string;
    try {
      email = Buffer.from(code, 'base64').toString('utf-8');
      if (!email.includes('@')) {
        throw new Error();
      }
    } catch {
      throw new AuthenticationError('Invalid code');
    }

    const externalId = `mock-${crypto.randomBytes(8).toString('hex')}`;
    const user: AuthUser = {
      id: externalId,
      email,
      externalId,
    };

    const tokens = this.generateTokens(user);
    return { ...tokens, user };
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, this.config.auth.jwtSecret) as any;

      if (!decoded.refreshTokenId) {
        throw new InvalidTokenError('Invalid refresh token');
      }

      const user: AuthUser = {
        id: decoded.sub,
        email: decoded.email,
        externalId: decoded.externalId,
      };

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof InvalidTokenError) throw error;
      throw new InvalidTokenError('Failed to refresh token');
    }
  }

  async validateAccessToken(token: string): Promise<AuthUser> {
    try {
      const decoded = jwt.verify(token, this.config.auth.jwtSecret) as any;

      return {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        externalId: decoded.externalId,
      };
    } catch (error) {
      throw new InvalidTokenError('Invalid or expired token');
    }
  }

  async revokeRefreshToken(_refreshToken: string): Promise<void> {
    // Mock provider doesn't persist tokens, so nothing to revoke
  }

  private generateTokens(user: AuthUser): AuthTokens {
    const accessTokenExpiry = 15 * 60; // 15 minutes
    const refreshTokenExpiry = 7 * 24 * 60 * 60; // 7 days

    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        externalId: user.externalId,
        type: 'access',
      },
      this.config.auth.jwtSecret,
      { expiresIn: accessTokenExpiry }
    );

    const refreshTokenId = crypto.randomBytes(8).toString('hex');
    const refreshToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        externalId: user.externalId,
        refreshTokenId,
        type: 'refresh',
      },
      this.config.auth.jwtSecret,
      { expiresIn: refreshTokenExpiry }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiry,
    };
  }
}
