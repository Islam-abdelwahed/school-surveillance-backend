import "dotenv/config";
import { createApp } from "./config/app";
import { env } from "./config/env";
import dbConfig from "./config/db";
import { logger } from "./utils/logger";

const startServer = async () => {
  try {
    const app = createApp();

    await dbConfig.connect();

    const server = app.listen(env.PORT, () => {});

    const shutdown = (signal: string) => {
      logger.info(`${signal} received: closing server`);
      server.close(async () => {
        await dbConfig.connect();
        logger.info("Server closed");
        process.exit(0);
      });

      process.on("SIGTERM", () => shutdown("SIGTERM"));
      process.on("SIGINT", () => shutdown("SIGINT"));
    };
  } catch (error) {
    process.exit(1);
  }
};

startServer();
