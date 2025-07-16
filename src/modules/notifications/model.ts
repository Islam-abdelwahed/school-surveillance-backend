import { Schema, model, Document, Types } from 'mongoose';

export interface INotification {
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'system' | 'alert' | 'event';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface INotificationModel extends INotification, Document {}

const NotificationSchema = new Schema<INotificationModel>(
  {
    user_id: { type: String, required: true, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: { 
      type: String, 
      enum: ['system', 'alert', 'event'],
      default: 'system'
    },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const NotificationModel = model<INotificationModel>('Notification', NotificationSchema);