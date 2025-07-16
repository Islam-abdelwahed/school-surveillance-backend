import express from "express";
import { NotificationController } from "./controller";

// export const notificationRoutes = (controller: NotificationController) => {
//   const router = express.Router();

//   router.get("/", controller.getNotifications.bind(controller));
//   router.get("/unread-count", controller.getUnreadCount.bind(controller));
//   router.patch("/:id/read", controller.markAsRead.bind(controller));
//   router.patch("/read-all", controller.markAllAsRead.bind(controller));

//   return router;
// };
