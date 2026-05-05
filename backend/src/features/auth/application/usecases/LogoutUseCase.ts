import type { PrismaClient } from '@prisma/client';
import type { IAuthProvider, LogoutInput, LogoutOutput } from '../types/auth.types';
import { TokenService } from './TokenService';

export class LogoutUseCase {
  private tokenService: TokenService;
  private prisma: PrismaClient;

  constructor(authProvider: IAuthProvider, prisma: PrismaClient) {
    this.prisma = prisma;
    this.tokenService = new TokenService(authProvider, prisma);
  }

  async execute(input: LogoutInput): Promise<LogoutOutput> {
    try {
      if (input.allSessions) {
        // Revoke all refresh tokens for the user (logout all devices)
        await this.tokenService.revokeAllUserTokens(input.userId);
      } else if (input.refreshToken) {
        // Revoke single refresh token (logout current device)
        await this.tokenService.revokeRefreshToken(input.refreshToken);
      }

      // Log logout action
      await this.prisma.sessionLog.create({
        data: {
          userId: input.userId,
          action: 'LOGOUT',
        },
      });

      return { success: true };
    } catch (error) {
      // Log the error but still consider logout successful
      // (frontend should clear tokens regardless)
      console.error('Logout error:', error);
      return { success: true };
    }
  }
}
