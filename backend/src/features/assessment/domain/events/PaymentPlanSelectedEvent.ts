import { DomainEvent } from '@/core/domain/common/DomainEvent';

export interface PaymentPlanSelectedEventPayload {
  planType: 'Conservative' | 'Balanced' | 'Aggressive';
  selectedAt: Date;
}

export class PaymentPlanSelectedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    readonly payload: PaymentPlanSelectedEventPayload
  ) {
    super(aggregateId, 'Assessment', aggregateVersion);
  }

  getEventName(): string {
    return 'PaymentPlanSelected';
  }
}
