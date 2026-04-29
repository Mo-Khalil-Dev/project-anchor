// ============ Interfaces ============

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

// ============ Errors ============

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class InvalidTokenError extends Error {
  constructor(message: string = 'Invalid or expired token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

export class TokenExpiredError extends Error {
  constructor(message: string = 'Token has expired') {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

export class InvalidStateError extends Error {
  constructor(message: string = 'Invalid OAuth state') {
    super(message);
    this.name = 'InvalidStateError';
  }
}

export class ProviderConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProviderConfigError';
  }
}

export class RefreshTokenRevocationError extends Error {
  constructor(message: string = 'Failed to revoke refresh token') {
    super(message);
    this.name = 'RefreshTokenRevocationError';
  }
}

// ============ Use Case DTOs ============

export interface InitiateLoginInput {
  redirectUri: string;
}

export interface InitiateLoginOutput {
  loginUrl: string;
  state: string;
}

export interface HandleAuthCallbackInput {
  code: string;
  state: string;
  redirectUri: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshAccessTokenInput {
  refreshToken: string;
}

export interface ValidateTokenInput {
  accessToken: string;
}

export interface LogoutInput {
  userId: string;
  refreshToken?: string;
  allSessions?: boolean;
}

export interface LogoutOutput {
  success: boolean;
}

export interface GetRedirectToJourneyInput {
  userId: string;
}

export interface GetRedirectToJourneyOutput {
  redirectUrl: string;
}
