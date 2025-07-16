import { NextFunction, Request, Response } from "express";
import { NotificationService } from "./service";

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.context?.userId;
      const { read, limit = 20, page = 1 } = req.query;

      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const notifications = await this.notificationService.getUserNotifications(
        userId,
        {
          read: read === "true" ? true : read === "false" ? false : undefined,
          limit: Number(limit),
          skip: (Number(page) - 1) * Number(limit),
        }
      );

      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.context?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const count = await this.notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.markAsRead(id);

      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.context?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      this.notificationService.readAll(userId);

      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
