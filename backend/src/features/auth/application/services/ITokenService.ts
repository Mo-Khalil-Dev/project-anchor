import type { AuthTokens, AuthUser } from '../../types/auth.types';

export interface IssuedTokens extends AuthTokens {
  user: AuthUser;
}

export interface ITokenService {
  issueTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    user: AuthUser
  ): Promise<IssuedTokens>;
  refreshAccessToken(refreshToken: string): Promise<AuthTokens>;
  validateAccessToken(accessToken: string): Promise<AuthUser>;
  revokeRefreshToken(refreshToken: string): Promise<void>;
  revokeAllUserTokens(userId: string): Promise<void>;
}
