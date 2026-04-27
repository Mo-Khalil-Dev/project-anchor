export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  externalId: string;
}

export interface IAuthProvider {
  initiateLogin(redirectUri: string): Promise<{ loginUrl: string; state: string }>;

  handleCallback(code: string, state: string, redirectUri: string): Promise<AuthTokens & { user: AuthUser }>;

  refreshAccessToken(refreshToken: string): Promise<AuthTokens>;

  validateAccessToken(token: string): Promise<AuthUser>;

  revokeRefreshToken(refreshToken: string): Promise<void>;
}
