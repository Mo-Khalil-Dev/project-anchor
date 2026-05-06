import { DomainEvent } from '@/features/shared/domain/DomainEvent';

export interface IEventHandler<T extends DomainEvent = DomainEvent> {
  handle(event: T): Promise<void>;
}
