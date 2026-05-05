import { DomainEvent } from '@/features/shared/domain/DomainEvent';

export interface AssessmentCompletedEventPayload {
  hardshipLevel: string;
  disposableIncome: number;
  billRatio: number;
  paymentPlans: string | null;
}

export class AssessmentCompletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    readonly payload: AssessmentCompletedEventPayload
  ) {
    super(aggregateId, 'Assessment', aggregateVersion);
  }

  getEventName(): string {
    return 'AssessmentCompleted';
  }
}
