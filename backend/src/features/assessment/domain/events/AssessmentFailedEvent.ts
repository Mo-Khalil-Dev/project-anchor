import { DomainEvent } from '@/core/domain/common/DomainEvent';

export interface AssessmentFailedEventPayload {
  reason: string;
  errorCode?: string;
}

export class AssessmentFailedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    readonly payload: AssessmentFailedEventPayload
  ) {
    super(aggregateId, 'Assessment', aggregateVersion);
  }

  getEventName(): string {
    return 'AssessmentFailed';
  }
}
