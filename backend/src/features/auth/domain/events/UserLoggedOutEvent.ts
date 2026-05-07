import { DomainEvent } from '@/core/domain/common/DomainEvent';

export interface UserLoggedOutEventPayload {
  reason: string;
}

export class UserLoggedOutEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    readonly payload: UserLoggedOutEventPayload
  ) {
    super(aggregateId, 'User', aggregateVersion);
  }

  getEventName(): string {
    return 'UserLoggedOut';
  }
}
