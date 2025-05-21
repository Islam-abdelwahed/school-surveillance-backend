import { AuthController } from "./modules/auth/controller";
import { AuthService } from "./modules/auth/service";
import { UserService } from "./modules/users/service";
import { UsersController } from "./modules/users/controller";
import { UserModel } from "./modules/users/model";
import { DeviceController } from "./modules/devices/controller";
import { DeviceService } from "./modules/devices/service";
import DeviceModel from "./modules/devices/model";
import { JWTUtils } from "./utils/JWTUtils";
import { VideoCleanupService } from "./core/scheduler/video-cleanup";

export class Container {
  public readonly userService: UserService;
  public readonly deviceService: DeviceService;
  public readonly authService: AuthService;
  public readonly authController: AuthController;
  public readonly deviceController: DeviceController;
  public readonly userController: UsersController;
  public readonly jwt: JWTUtils;
  public readonly videoCleanupService: VideoCleanupService;
  constructor() {
    this.userService = new UserService(UserModel);
    this.deviceService = new DeviceService(DeviceModel);
    this.jwt = new JWTUtils();
    this.authService = new AuthService(
      this.userService,
      this.deviceService,
      this.jwt
    );
    this.authController = new AuthController(this.authService);
    this.deviceController = new DeviceController(this.deviceService);
    this.userController = new UsersController(this.userService);
    
    this.videoCleanupService = new VideoCleanupService();
    process.on("SIGTERM", async () => {
      await this.videoCleanupService.shutdown();
    });
    process.on("SIGINT", async () => {
      await this.videoCleanupService.shutdown();
    });
  }
}
