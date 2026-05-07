import { DomainEvent } from '@/core/domain/common/DomainEvent';

export interface UserCreatedEventPayload {
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export class UserCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    readonly payload: UserCreatedEventPayload
  ) {
    super(aggregateId, 'User', aggregateVersion);
  }

  getEventName(): string {
    return 'UserCreated';
  }
}
