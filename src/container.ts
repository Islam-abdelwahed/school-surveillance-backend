import UserModel from "./modules/users/model";
import DeviceModel from "./modules/devices/model";
import VideoModel from "./modules/video/model";
import StorageConfigModel from "./modules/storage-settings/models/storage.config.model";
import StorageStatusModel from "./modules/storage-settings/models/storage.status.model";

import { VideoController } from "./modules/video/controller";
import { AuthController } from "./modules/auth/controller";
import { UsersController } from "./modules/users/controller";
import { DeviceController } from "./modules/devices/controller";
import { StorageController } from "./modules/storage-settings/controller";

import { AuthService } from "./modules/auth/service";
import { UserService } from "./modules/users/service";
import { DeviceService } from "./modules/devices/service";
import { VideoService } from "./modules/video/service";
import { FileStorageService } from "./core/storage/storage";
import { StorageSettingsService } from "./modules/storage-settings/service";
import { VideoCleanupService } from "./core/scheduler/video-cleanup";

import { JWTUtils } from "./utils/JWTUtils";
import { StorageMonitorService } from "./core/scheduler/health-monitor";
import { WebSocketCoreService } from "./core/websocket/service";
import { StreamingService } from "./modules/streaming/service";
import { EventBus } from "./core/events/event-bus";
import { CoreNotificationService } from "./core/notifications/service";
import { NotificationService } from "./modules/notifications/service";

export class Container {
  public readonly storageController: StorageController;
  public readonly storageSettingsService: StorageSettingsService;
  public readonly userService: UserService;
  public readonly deviceService: DeviceService;
  public readonly authService: AuthService;
  public readonly authController: AuthController;
  public readonly deviceController: DeviceController;
  public readonly userController: UsersController;
  public readonly fileStorageService: FileStorageService;
  public readonly videoService: VideoService;
  public readonly videoController: VideoController;
  public readonly jwt: JWTUtils;
  public readonly videoCleanupService: VideoCleanupService;
  public readonly storageMonitorService: StorageMonitorService;
  public readonly wsService: WebSocketCoreService;
  public readonly streamingService: StreamingService;
  public readonly eventBus: EventBus;
  public readonly coreNotificationService: CoreNotificationService;
  public readonly notificationService: NotificationService;

  constructor() {
    this.storageSettingsService = new StorageSettingsService(
      StorageConfigModel,
      StorageStatusModel
    );

    this.deviceService = new DeviceService(DeviceModel);
    this.jwt = new JWTUtils();
    this.wsService = new WebSocketCoreService(this.jwt);
    this.eventBus = new EventBus();
    this.coreNotificationService = new CoreNotificationService(
      this.eventBus,
      this.wsService
    );
    this.notificationService = new NotificationService(this.eventBus);
    this.streamingService = new StreamingService(this.wsService);
    this.userService = new UserService(UserModel);
    this.authService = new AuthService(
      this.userService,
      this.deviceService,
      this.jwt
    );
    this.fileStorageService = new FileStorageService();
    this.videoService = new VideoService(
      this.storageSettingsService,
      VideoModel,
      this.fileStorageService,
      this.eventBus
    );
    this.eventBus.register("video_processed", async (payload) => {
      this.notificationService.createSystemNotification(
        payload.userId,
        payload.title,
        payload.message,
        { time: payload.time }
      );
    });
    this.storageController = new StorageController(this.storageSettingsService);
    this.userController = new UsersController(this.userService);
    this.authController = new AuthController(this.authService);
    this.deviceController = new DeviceController(this.deviceService);
    this.videoController = new VideoController(this.videoService);

    this.videoCleanupService = new VideoCleanupService(
      this.storageSettingsService,
      this.videoService
    );
    this.storageMonitorService = new StorageMonitorService(
      this.storageSettingsService
    );
    this.init();
  }

  private async init() {
    await this.videoCleanupService.initialize();
    await this.storageMonitorService.initialize();
  }
}
