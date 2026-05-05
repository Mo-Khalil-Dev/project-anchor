import { DomainEvent } from '@/features/shared/domain/DomainEvent';

export interface AssessmentCreatedEventPayload {
  customerId: string;
  bankConnectionId: string | null;
}

export class AssessmentCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    readonly payload: AssessmentCreatedEventPayload
  ) {
    super(aggregateId, 'Assessment', aggregateVersion);
  }

  getEventName(): string {
    return 'AssessmentCreated';
  }
}
