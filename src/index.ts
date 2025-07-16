import "dotenv/config";
import { createApp } from "./config/app";
import { env } from "./config/env";
import http from "http";
import dbConfig from "./config/db";
import { logger } from "./utils/logger";
import { Container } from "./container";
const startServer = async () => {
  try {
    const container = new Container();
    const app = createApp(container);
    const server = http.createServer(app);

    container.wsService.attachToServer(server);

    await dbConfig.connect();

    server.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    const shutdown = (signal: string) => {
      logger.info(`${signal} received: closing server`);
      server.close(async () => {
        await dbConfig.disconnect();
        logger.info("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    await dbConfig.disconnect();
    process.exit(1);
  }
};

startServer();
