import { WebSocketCoreService } from "../../core/websocket/service";
import { NotificationModel, INotificationModel } from "./model";
import { Types } from "mongoose";
import { logger } from "../../utils/logger";
import { EventBus } from "../../core/events/event-bus";

export class NotificationService {
  constructor(private eventBus: EventBus) {}

  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ) {
    
    const notification = new NotificationModel({
      user_id: userId,
      title,
      message,
      type: 'system',
      metadata
    });
    await notification.save();

    
    this.eventBus.publish('notification', {
      userId,
      title,
      message,
      type: 'system',
      metadata
    });

    return notification;
  }

  async markAsRead(notificationId: string): Promise<INotificationModel | null> {
    return NotificationModel.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  }

  async getUserNotifications(
    userId: string,
    options: {
      read?: boolean;
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<INotificationModel[]> {
    const query: any = { user_id: new Types.ObjectId(userId) };

    if (options.read !== undefined) {
      query.read = options.read;
    }

    return NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({
      user_id: new Types.ObjectId(userId),
      read: false,
    });
  }

  async readAll(userId: string){
     await NotificationModel.updateMany(
        { user_id: userId, read: false },
        { $set: { read: true } }
      );
  }
}
