import type { PrismaClient } from '@prisma/client';
import type { IAuthProvider, ValidateTokenInput } from '../types/auth.types';
import { TokenService } from './TokenService';

export interface ValidateTokenOutput {
  isValid: boolean;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  error?: string;
}

export class ValidateTokenUseCase {
  private tokenService: TokenService;
  private prisma: PrismaClient;

  constructor(authProvider: IAuthProvider, prisma: PrismaClient) {
    this.prisma = prisma;
    this.tokenService = new TokenService(authProvider, prisma);
  }

  async execute(input: ValidateTokenInput): Promise<ValidateTokenOutput> {
    try {
      const authUser = await this.tokenService.validateAccessToken(input.accessToken);

      // Find user in database
      const dbUser = await this.prisma.user.findUnique({
        where: { externalId: authUser.externalId },
      });

      if (!dbUser) {
        return {
          isValid: false,
          error: 'User not found',
        };
      }

      return {
        isValid: true,
        user: {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.firstName || undefined,
          lastName: dbUser.lastName || undefined,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Token validation failed',
      };
    }
  }
}
