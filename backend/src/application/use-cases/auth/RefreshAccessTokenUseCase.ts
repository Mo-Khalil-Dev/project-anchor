import type { PrismaClient } from '@prisma/client';
import type { IAuthProvider } from '../../../domain/auth/IAuthProvider';
import { TokenService } from '../../services/TokenService';

export interface RefreshAccessTokenInput {
  refreshToken: string;
}

export interface RefreshAccessTokenOutput {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class RefreshAccessTokenUseCase {
  private tokenService: TokenService;

  constructor(authProvider: IAuthProvider, prisma: PrismaClient) {
    this.tokenService = new TokenService(authProvider, prisma);
  }

  async execute(input: RefreshAccessTokenInput): Promise<RefreshAccessTokenOutput> {
    const newTokens = await this.tokenService.refreshAccessToken(input.refreshToken);

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      expiresIn: newTokens.expiresIn,
    };
  }
}
