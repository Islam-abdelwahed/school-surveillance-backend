import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import { JWTUtils } from "../../utils/JWTUtils";
import Stream from "stream";
import { parse } from "url";
import { logger } from "../../utils/logger";

type ConnectionType = "camera" | "client";
interface req extends http.IncomingMessage {
  type: ConnectionType;
  connectionID: string;
}

export class WebSocketCoreService {
  private wss: WebSocketServer;
  private connections = new Map<string, WebSocket>();

  public onCameraMessage: (connectionId: string, data: Buffer) => void =
    () => {};
  public onClientMessage: (connectionId: string, data: Buffer) => void =
    () => {};

  constructor(private readonly jwt: JWTUtils) {
    this.wss = new WebSocketServer({ noServer: true });
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.wss.on("connection", (ws: WebSocket, request: req) => {
      const { connectionID, type } = request;
      logger.warn(`type:${type}`);
      this.connections.set(connectionID, ws);
      ws.on("error", (err) => logger.error("WS error:", err));
      ws.on("message", (data: Buffer) => {
        if (type === "camera") {
          logger.warn("camera start");
          this.onCameraMessage(connectionID, data);
        } else if (type === "client") {
          logger.warn("client is talking");
          this.onClientMessage(connectionID, data);
        }
      });
      ws.on("close", () => this.connections.delete(connectionID));
    });
  }

  async handleUpgrade(
    request: http.IncomingMessage,
    socket: Stream.Duplex,
    head: Buffer,
    type: ConnectionType
  ) {
    try {
      const connectionID = await this.authenticate(request, type);
      this.wss.handleUpgrade(request, socket, head, (ws, request) => {
        this.wss.emit("connection", ws, { ...request, connectionID, type });
      });
    } catch (error) {
      socket.destroy();
    }
  }

  private async authenticate(
    request: http.IncomingMessage,
    type: ConnectionType
  ): Promise<string> {
    if (type === "camera") {
      const cameraId = request.headers["x-camera-id"] as string;
      return `camera-${123456789}`;
    } else {
      const token = request.headers["sec-websocket-protocol"] as string;
      // const payload = this.jwt.verifyAccessToken(token);
      return `client-${123456}`;
    }
  }

  attachToServer(server: http.Server) {
    server.on("upgrade", (request, socket, head) => {
      try {
        //   const parsedUrl = parse(request.url||'');
        logger.warn(`URL:${request.url}`);
        const pathname = request.url || "";

        if (pathname === "/camera") {
          this.handleUpgrade(request, socket, head, "camera");
        } else if (pathname === "/client") {
          this.handleUpgrade(request, socket, head, "client");
        } else {
          logger.warn(`Invalid WebSocket path: ${pathname} from host.`);
          socket.destroy();
        }
      } catch (err) {
        logger.error("Upgrade failed", err);
        socket.destroy();
      }
    });
  }

  async close() {
    this.wss.close();
    this.connections.forEach((ws) => ws.close());
  }

  send(connectionId: string, data: Buffer) {
    const ws = this.connections.get(connectionId);
    ws?.send(data);
  }

  broadcast(filter: (id: string) => boolean, data: Buffer) {
    this.connections.forEach((ws, id) => {
      if(filter(id)) ws.send(data);
    });
  }
  public broadcastToUser(userId: string, data: Buffer): void {
    this.broadcast(
      (connId) => connId.startsWith(`client-`) && connId.includes(`-${userId}`),
      data
    );
  }
}
