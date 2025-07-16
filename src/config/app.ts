import express from "express";
import helmet from "helmet";
import { Container } from "../container";
import { authRoutes } from "../modules/auth/routes";
import { usersRoutes } from "../modules/users/routes";
import { videoRoutes } from "../modules/video/routes";
import { storageRoutes } from "../modules/storage-settings/routes";
import { deviceRoutes } from "../modules/devices/routes";
import { authGuard } from "../middleware/auth";
import cors from "cors";
export const createApp = (container: Container) => {
  const app = express();

  app.use(express.json());
  app.use(cors());
  // app.use(multer().none());
  app.use(helmet());

  app.use("/api/v1/auth", authRoutes(container.authController));
  app.use(
    "/api/v1/users",
    authGuard(container.jwt),
    usersRoutes(container.userController)
  );
  app.use(
    "/api/v1/videos",
    authGuard(container.jwt),
    videoRoutes(container.videoController)
  );
  app.use(
    "/api/v1/system",
    authGuard(container.jwt),
    storageRoutes(container.storageController)
  );
  app.use(
    "/api/v1/devices",
    authGuard(container.jwt),
    deviceRoutes(container.deviceController)
  );

  return app;
};
