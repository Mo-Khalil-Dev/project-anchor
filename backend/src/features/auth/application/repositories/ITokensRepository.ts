import type { RefreshToken } from '../../domain/entities/RefreshToken';

export interface ITokensRepository {
  createRefreshToken(data: {
    userId: string;
    token: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshToken>;

  findRefreshToken(token: string): Promise<RefreshToken | null>;

  updateRefreshToken(id: string, data: {
    token: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshToken>;

  revokeRefreshToken(id: string): Promise<void>;

  revokeAllUserTokens(userId: string): Promise<void>;
}
