import { DomainEvent } from '@/core/domain/common/DomainEvent';

export interface IEventHandler<T extends DomainEvent = DomainEvent> {
  handle(event: T): Promise<void>;
}
