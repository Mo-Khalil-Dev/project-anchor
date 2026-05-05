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
