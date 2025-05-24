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
import { StorageService } from "./modules/storage-settings/service";
import { VideoCleanupService } from "./core/scheduler/video-cleanup";

import { JWTUtils } from "./utils/JWTUtils";

export class Container {
  public readonly storageController: StorageController;
  public readonly storageService: StorageService;
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
  // public readonly videoCleanupService: VideoCleanupService;

  constructor() {
    this.storageService = new StorageService(
      StorageConfigModel,
      StorageStatusModel
    );
    this.storageController = new StorageController(this.storageService);
    this.deviceService = new DeviceService(DeviceModel);
    this.jwt = new JWTUtils();
    this.userService = new UserService(UserModel);
    this.authService = new AuthService(
      this.userService,
      this.deviceService,
      this.jwt
    );
    this.userController = new UsersController(this.userService);
    this.authController = new AuthController(this.authService);
    this.deviceController = new DeviceController(this.deviceService);
    this.fileStorageService = new FileStorageService();
    this.videoService = new VideoService(VideoModel, this.fileStorageService);
    this.videoController = new VideoController(this.videoService);

  }
}

// this.videoCleanupService = new VideoCleanupService();
// process.on("SIGTERM", async () => {
//   await this.videoCleanupService.shutdown();
// });
// process.on("SIGINT", async () => {
//   await this.videoCleanupService.shutdown();
// });