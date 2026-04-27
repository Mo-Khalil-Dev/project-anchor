import type { PrismaClient } from '@prisma/client';
import type { IAuthProvider } from '../../../domain/auth/IAuthProvider';
import { TokenService } from '../../services/TokenService';

export interface HandleAuthCallbackInput {
  code: string;
  state: string;
  redirectUri: string;
}

export interface HandleAuthCallbackOutput {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export class HandleAuthCallbackUseCase {
  private tokenService: TokenService;

  constructor(
    private authProvider: IAuthProvider,
    private prisma: PrismaClient
  ) {
    this.tokenService = new TokenService(authProvider, prisma);
  }

  async execute(input: HandleAuthCallbackInput): Promise<HandleAuthCallbackOutput> {
    // Exchange auth code for tokens
    const { accessToken, refreshToken, expiresIn, user } = await this.authProvider.handleCallback(
      input.code,
      input.state,
      input.redirectUri
    );

    // Find or create user in database
    // First try by externalId, then by email (for providers with dynamic IDs like mock)
    let dbUser = await this.prisma.user.findUnique({
      where: { externalId: user.externalId },
    });

    if (!dbUser) {
      // Try finding by email
      dbUser = await this.prisma.user.findUnique({
        where: { email: user.email },
      });
    }

    if (!dbUser) {
      dbUser = await this.prisma.user.create({
        data: {
          email: user.email,
          externalId: user.externalId,
          firstName: user.firstName,
          lastName: user.lastName,
          role: 'customer',
        },
      });
    } else {
      // Update user info and externalId if changed
      dbUser = await this.prisma.user.update({
        where: { id: dbUser.id },
        data: {
          externalId: user.externalId,
          firstName: user.firstName || dbUser.firstName,
          lastName: user.lastName || dbUser.lastName,
        },
      });
    }

    // Store tokens and get issued tokens back
    const issuedTokens = await this.tokenService.issueTokens(
      accessToken,
      refreshToken,
      expiresIn,
      {
        id: dbUser.id,
        email: dbUser.email,
        externalId: dbUser.externalId,
        firstName: dbUser.firstName || undefined,
        lastName: dbUser.lastName || undefined,
      }
    );

    // Log successful login
    await this.prisma.sessionLog.create({
      data: {
        userId: dbUser.id,
        action: 'LOGIN',
      },
    });

    return {
      accessToken: issuedTokens.accessToken,
      refreshToken: issuedTokens.refreshToken,
      expiresIn: issuedTokens.expiresIn,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName || undefined,
        lastName: dbUser.lastName || undefined,
      },
    };
  }
}
