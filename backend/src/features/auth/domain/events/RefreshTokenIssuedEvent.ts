import { DomainEvent } from '@/features/shared/domain/DomainEvent';

export interface RefreshTokenIssuedEventPayload {
  tokenId: string;
  expiresAt: Date;
}

export class RefreshTokenIssuedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    readonly payload: RefreshTokenIssuedEventPayload
  ) {
    super(aggregateId, 'User', aggregateVersion);
  }

  getEventName(): string {
    return 'RefreshTokenIssued';
  }
}
