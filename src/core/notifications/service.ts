import { EventBus } from "../events/event-bus";
import { WebSocketCoreService } from "../websocket/service";

export class CoreNotificationService {
  constructor(
    private eventBus: EventBus,
    private wsService: WebSocketCoreService
  ) {
    this.registerHandlers();
  }

  private registerHandlers() {
    this.eventBus.register("notification", async (payload) => {
      await this.handleNotificationEvent(payload);
    });
  }

  private async handleNotificationEvent(payload: {
    userId: string;
    title: string;
    message: string;
    type: string;
    metadata?: Record<string, any>;
  }) {
    const notificationData = Buffer.from(
      JSON.stringify({
        title: payload.title,
        subtitle: payload.message,
        time: payload.metadata?.time,
      })
    );

    this.wsService.broadcastToUser(payload.userId, notificationData);
  }
}
