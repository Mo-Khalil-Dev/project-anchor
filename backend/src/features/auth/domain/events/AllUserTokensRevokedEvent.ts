import { DomainEvent } from '@/features/shared/domain/DomainEvent';

export interface AllUserTokensRevokedEventPayload {
  reason: string;
}

export class AllUserTokensRevokedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    readonly payload: AllUserTokensRevokedEventPayload
  ) {
    super(aggregateId, 'User', aggregateVersion);
  }

  getEventName(): string {
    return 'AllUserTokensRevoked';
  }
}
