import type { RefreshToken as PrismaRefreshToken } from '@prisma/client';
import { RefreshToken } from '@/features/auth/domain/entities/RefreshToken';

export class RefreshTokenMapper {
  static toDomain(raw: PrismaRefreshToken): RefreshToken {
    return new RefreshToken(
      raw.id,
      raw.userId,
      raw.token,
      raw.tokenHash,
      raw.expiresAt,
      raw.revokedAt,
      raw.createdAt
    );
  }

  static toPersistence(domain: RefreshToken): Partial<PrismaRefreshToken> {
    return {
      id: domain.id,
      userId: domain.getUserId(),
      token: domain.getToken(),
      tokenHash: domain.getTokenHash(),
      expiresAt: domain.getExpiresAt(),
      revokedAt: domain.getRevokedAt(),
    };
  }
}
