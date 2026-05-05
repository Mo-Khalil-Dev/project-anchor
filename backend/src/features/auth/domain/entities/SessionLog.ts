import { Entity } from '@/features/shared/domain/Entity';

export type SessionAction = 'LOGIN' | 'LOGOUT' | 'TOKEN_REFRESH' | 'TOKEN_REVOKE';

export class SessionLog extends Entity<string> {
  constructor(
    id: string,
    private readonly userId: string,
    private readonly action: SessionAction,
    private readonly ipAddress?: string,
    private readonly userAgent?: string,
    createdAt: Date = new Date()
  ) {
    super(id, createdAt);
  }

  getUserId(): string {
    return this.userId;
  }

  getAction(): SessionAction {
    return this.action;
  }

  getIpAddress(): string | undefined {
    return this.ipAddress;
  }

  getUserAgent(): string | undefined {
    return this.userAgent;
  }
}
