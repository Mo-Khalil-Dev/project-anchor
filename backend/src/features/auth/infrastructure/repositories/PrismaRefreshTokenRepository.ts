import type { PrismaClient } from '@prisma/client';
import type { RefreshToken } from '../../domain/entities/RefreshToken';
import type { ITokensRepository } from '../../application/repositories/ITokensRepository';
import { RefreshTokenMapper } from '../mappers/RefreshTokenMapper';

export class PrismaRefreshTokenRepository implements ITokensRepository {
  constructor(private prisma: PrismaClient) {}

  async createRefreshToken(data: {
    userId: string;
    token: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    const refreshToken = await this.prisma.refreshToken.create({
      data,
    });
    return RefreshTokenMapper.toDomain(refreshToken);
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    return refreshToken ? RefreshTokenMapper.toDomain(refreshToken) : null;
  }

  async updateRefreshToken(
    id: string,
    data: {
      token: string;
      tokenHash: string;
      expiresAt: Date;
    }
  ): Promise<RefreshToken> {
    const refreshToken = await this.prisma.refreshToken.update({
      where: { id },
      data,
    });
    return RefreshTokenMapper.toDomain(refreshToken);
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }
}
