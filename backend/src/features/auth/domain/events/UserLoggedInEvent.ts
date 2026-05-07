import { DomainEvent } from '@/core/domain/common/DomainEvent';

export interface UserLoggedInEventPayload {
  accessTokenExpiresAt: Date;
}

export class UserLoggedInEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    readonly payload: UserLoggedInEventPayload
  ) {
    super(aggregateId, 'User', aggregateVersion);
  }

  getEventName(): string {
    return 'UserLoggedIn';
  }
}
