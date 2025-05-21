import { UserService } from "../users/service";
import { DeviceService } from "../devices/service";
import { CryptoUtils } from "../../utils/crypto";
import { LoginParams, RegisterParams } from "./types";
import { JWTUtils } from "../../utils/JWTUtils";

export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly deviceService: DeviceService,
    private readonly jwt: JWTUtils
  ) {}

  async registerUser(params: RegisterParams) {
    // 1. Check existing user
    const existingUser = await this.userService.findByEmail(params.email);
    if (existingUser) throw new Error("USER_ALREADY_EXISTS");

    // 2. Hash password
    const passwordHash = await CryptoUtils.hashPassword(params.password);

    // 3. Create user
    const user = await this.userService.createUser({
      username: params.username,
      email: params.email,
      passwordHash,
    });

    // 4. Register device
    const device = await this.deviceService.registerDevice({
      userId: user.id,
      publicKey: params.device.publicKey,
      deviceName: params.device.name,
    });

    // 5. Generate tokens
    return {
      userId: user.id,
      deviceId: device.id,
      accessToken: this.jwt.generateAccessToken(user.id),
      refreshToken: this.jwt.generateRefreshToken(user.id, device.id),
    };
  }

  async loginWithDevice(params: LoginParams) {
  // // 1. Check existing user
  //   const existingUser = await this.userService.findByEmail(params.email);
  //   if (!existingUser) throw new Error("USER_NOT_EXISTS");

  //   // 2. Hash password
  //   const passwordHash = await CryptoUtils.hashPassword(params.password);

  //   if(passwordHash!==existingUser.password)
  //   {
  //     throw new Error("INCORRECT_PASSWORD");
  //   }
  //   // 3. Create user
  //   const user = await this.userService.createUser({
  //     username: params.username,
  //     email: params.email,
  //     passwordHash,
  //   });

  //   // 4. Register device
  //   if(params.device.name){
        
  //   }

  //   // 5. Generate tokens
  //   return {
  //     userId: user.id,
  //     deviceId: device.id,
  //     accessToken: this.jwt.generateAccessToken(user.id),
  //     refreshToken: this.jwt.generateRefreshToken(user.id, device.id),
  //   };
  }
}
