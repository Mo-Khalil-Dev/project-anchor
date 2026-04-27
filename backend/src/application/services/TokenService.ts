import crypto from 'crypto';
import type { PrismaClient } from '@prisma/client';
import type { IAuthProvider, AuthTokens, AuthUser } from '../../domain/auth/IAuthProvider';
import { InvalidTokenError, RefreshTokenRevocationError } from '../../domain/auth/AuthErrors';

export interface IssuedTokens extends AuthTokens {
  user: AuthUser;
}

export class TokenService {
  constructor(
    private authProvider: IAuthProvider,
    private prisma: PrismaClient
  ) {}

  async issueTokens(accessToken: string, refreshToken: string, expiresIn: number, user: AuthUser): Promise<IssuedTokens> {
    const refreshTokenExpiry = 7 * 24 * 60 * 60; // 7 days
    const expiresAt = new Date(Date.now() + refreshTokenExpiry * 1000);

    // Store hashed refresh token in database
    const refreshTokenHash = this.hashToken(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token exists and is not revoked
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.revokedAt) {
      throw new InvalidTokenError('Refresh token is invalid or revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new InvalidTokenError('Refresh token has expired');
    }

    // Get new tokens from auth provider
    const newTokens = await this.authProvider.refreshAccessToken(refreshToken);

    // Hash and store new refresh token
    const refreshTokenHash = this.hashToken(newTokens.refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: newTokens.refreshToken,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    return newTokens;
  }

  async validateAccessToken(accessToken: string): Promise<AuthUser> {
    return this.authProvider.validateAccessToken(accessToken);
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken) {
        throw new InvalidTokenError('Refresh token not found');
      }

      // Mark as revoked
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      // Also revoke in auth provider if applicable
      await this.authProvider.revokeRefreshToken(refreshToken).catch(() => {
        // Provider may not support revocation (e.g., MockAuthProvider)
      });
    } catch (error) {
      if (error instanceof InvalidTokenError) throw error;
      throw new RefreshTokenRevocationError(`Failed to revoke token: ${error}`);
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
