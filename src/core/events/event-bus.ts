import { logger } from "../../utils/logger";

type EventHandler = (payload: any) => Promise<void>;

export class EventBus {
  private handlers: Record<string, EventHandler[]> = {};

  register(eventType: string, handler: EventHandler) {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }
    this.handlers[eventType].push(handler);
  }

  async publish(eventType: string, payload: any) {
    const handlers = this.handlers[eventType] || [];
    await Promise.allSettled(
      handlers.map(handler => 
        handler(payload).catch(err => {
          logger.error(`Event handler failed for ${eventType}:`, err);
        })
      )
    );
  }
}