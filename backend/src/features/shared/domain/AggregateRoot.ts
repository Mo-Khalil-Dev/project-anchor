import { Entity } from './Entity';
import { DomainEvent } from './DomainEvent';

export abstract class AggregateRoot<T> extends Entity<T> {
  private domainEvents: DomainEvent[] = [];
  private version: number = 1;

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  // Public method for use cases to record events when aggregate created externally
  public recordDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public getDomainEvents(): DomainEvent[] {
    return this.domainEvents;
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }

  public getVersion(): number {
    return this.version;
  }

  protected incrementVersion(): void {
    this.version++;
  }
}
