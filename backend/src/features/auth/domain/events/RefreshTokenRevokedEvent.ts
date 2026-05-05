import { DomainEvent } from '@/features/shared/domain/DomainEvent';

export interface RefreshTokenRevokedEventPayload {
  tokenId: string;
}

export class RefreshTokenRevokedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    readonly payload: RefreshTokenRevokedEventPayload
  ) {
    super(aggregateId, 'User', aggregateVersion);
  }

  getEventName(): string {
    return 'RefreshTokenRevoked';
  }
}
