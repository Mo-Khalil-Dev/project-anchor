import { Entity } from '@/features/shared/domain/Entity';

export class RefreshToken extends Entity<string> {
  constructor(
    id: string,
    private readonly userId: string,
    private readonly token: string,
    private readonly tokenHash: string,
    private readonly expiresAt: Date,
    private revokedAt: Date | null,
    createdAt: Date = new Date()
  ) {
    super(id, createdAt);
  }

  getUserId(): string {
    return this.userId;
  }

  getToken(): string {
    return this.token;
  }

  getTokenHash(): string {
    return this.tokenHash;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getRevokedAt(): Date | null {
    return this.revokedAt;
  }

  isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isRevoked() && !this.isExpired();
  }

  revoke(): void {
    this.revokedAt = new Date();
  }
}
