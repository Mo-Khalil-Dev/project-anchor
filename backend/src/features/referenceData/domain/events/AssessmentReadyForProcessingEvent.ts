import { DomainEvent } from '@/features/shared/domain/DomainEvent';

export interface AssessmentReadyForProcessingPayload {
  assessmentId: string;
}

export class AssessmentReadyForProcessingEvent extends DomainEvent {
  readonly assessmentId: string;

  constructor(
    aggregateId: string,
    aggregateVersion: number,
    readonly payload: AssessmentReadyForProcessingPayload
  ) {
    super(aggregateId, 'Assessment', aggregateVersion);
    this.assessmentId = aggregateId;
  }

  getEventName(): string {
    return 'AssessmentReadyForProcessing';
  }
}
