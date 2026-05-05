export class RefreshTokenRevocationError extends Error {
  constructor(message: string = 'Failed to revoke refresh token') {
    super(message);
    this.name = 'RefreshTokenRevocationError';
  }
}
