import { DomainEvent } from '@/features/shared/domain/DomainEvent';

export interface UserProfileUpdatedEventPayload {
  firstName: string | null;
  lastName: string | null;
}

export class UserProfileUpdatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    readonly payload: UserProfileUpdatedEventPayload
  ) {
    super(aggregateId, 'User', aggregateVersion);
  }

  getEventName(): string {
    return 'UserProfileUpdated';
  }
}
