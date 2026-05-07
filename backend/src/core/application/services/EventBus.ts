import type { IEventHandler } from './IEventHandler';
import { DomainEvent } from '@/core/domain/common/DomainEvent';

/**
 * Simple, minimal event bus.
 * Registers handlers by event name and dispatches events to them.
 */
export class EventBus {
  private handlers: Map<string, IEventHandler[]> = new Map();

  /**
   * Register a handler for a specific event type
   * @param eventName - The event name (e.g., 'AssessmentReadyForProcessing')
   * @param handler - The handler instance
   */
  register<T extends DomainEvent>(eventName: string, handler: IEventHandler<T>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  /**
   * Publish an event to all registered handlers
   * @param event - The domain event to publish
   */
  async publish(event: DomainEvent): Promise<void> {
    const eventName = event.getEventName();
    const handlers = this.handlers.get(eventName) || [];

    // Execute all handlers in parallel
    await Promise.all(handlers.map((handler) => handler.handle(event)));
  }
}
