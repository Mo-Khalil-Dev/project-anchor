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
