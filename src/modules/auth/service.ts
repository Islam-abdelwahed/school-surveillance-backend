import { UserService } from "../users/service";
import { DeviceService } from "../devices/service";
import { CryptoUtils } from "../../utils/crypto";
import { LoginParams, RegisterParams } from "./types";
import { JWTUtils } from "../../utils/JWTUtils";
import { logger } from "../../utils/logger";

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
    logger.warn("hash", passwordHash);
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
      accessToken: this.jwt.generateAccessToken(user.id, device.id),
      refreshToken: this.jwt.generateRefreshToken(user.id, device.id),
    };
  }

  async loginWithDevice(params: LoginParams) {
    try {
      const existingUser = await this.userService.findByEmail(params.email);

      if (!existingUser) throw new Error("USER_NOT_EXISTS");

      const isMatched = await CryptoUtils.comparePassword(
        params.password,
        existingUser.password
      );

      if (!isMatched) throw new Error("INCORRECT_PASSWORD");

      const device = await this.deviceService.getDevice(params.deviceId);

      if (device.is_revoked) throw new Error("DEVICE IS REVOKED");

      return {
        device: {
          id: device.id,
          name: device.name,
          publicKey: device.public_key,
        },
        accessToken: this.jwt.generateAccessToken(existingUser.id, device.id),
        refreshToken: this.jwt.generateRefreshToken(
          existingUser.id,
          device.id.toString()
        ),
      };
    } catch (error: any) {
      throw new Error(`Failed to login: ${error.message}`);
    }
  }

  async refreshToken(refreshToken: string) {
    const payload = this.jwt.verifyRefreshToken(refreshToken);
    if (!payload) throw new Error("INVALID_REFRESH_TOKEN");

    const device = await this.deviceService.getDevice(payload.deviceId);
    if (device.is_revoked) throw new Error("DEVICE_IS_REVOKED");

    return {
      accessToken: this.jwt.generateAccessToken(payload.userId, device.id),
      refreshToken: this.jwt.generateRefreshToken(
        payload.userId,
        device.id.toString()
      ),
    };
  }
}
