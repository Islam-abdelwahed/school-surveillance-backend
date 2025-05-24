import express from "express";
import helmet from "helmet";
import { Container } from "../container";
import { authRoutes } from "../modules/auth/routes";
import { usersRoutes } from "../modules/users/routes";
import { videoRoutes } from "../modules/video/routes";
import { storageRoutes } from "../modules/storage-settings/routes";

export const createApp = () => {
  const app = express();
  const container = new Container();

  app.use(express.json());
  app.use(helmet());

  app.use("/api/v1/auth", authRoutes(container.authController));
  app.use("/api/v1/users", usersRoutes(container.userController));
  app.use("/api/v1/videos", videoRoutes(container.videoController));
  app.use("/api/v1/config", storageRoutes(container.storageController));

  return app;
};
