export abstract class DomainEvent {
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly occurredAt: Date;
  readonly aggregateVersion: number;

  constructor(
    aggregateId: string,
    aggregateType: string,
    aggregateVersion: number
  ) {
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.occurredAt = new Date();
    this.aggregateVersion = aggregateVersion;
  }

  abstract getEventName(): string;
}
