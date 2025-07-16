import { WebSocketCoreService } from "../../core/websocket/service";
import { logger } from "../../utils/logger";

export class StreamingService {
  private subscriptions = new Map<string, string>();

  constructor(private readonly wsService: WebSocketCoreService) {
    this.setupHandlers();
  }

  private setupHandlers() {
    this.wsService.onCameraMessage = (connectionID: string, data: Buffer) => {
      const cameraId = connectionID.replace("camera-", "");
      // logger.warn(`${cameraId}`);
      this.wsService.broadcast(
        (id) =>
          id.startsWith("client-") && this.subscriptions.get(id) === cameraId,
        data
      );
    };

    this.wsService.onClientMessage = (connectionID: string, data: Buffer) => {
      const msg = JSON.parse(data.toString());
      logger.warn(msg)
      if (msg.type === "subscribe") {
        logger.warn("reach client 1")
        this.subscriptions.set(connectionID, msg.cameraId);
      }
    };
  }
}
