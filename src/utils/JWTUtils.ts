import { env } from "../config/env";
import jwt, { JwtPayload } from "jsonwebtoken";
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

export class JWTUtils {
  constructor(private readonly secret: string = env.JWT_SECRET) {}

  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, this.secret, { expiresIn: ACCESS_TOKEN_TTL });
  }
  generateRefreshToken(userId: string, deviceId: string): string {
    return jwt.sign({ userId, deviceId }, this.secret, {
      expiresIn: REFRESH_TOKEN_TTL,
    });
  }

  verfiyToken(token: string): { userId: string; deviceId: string } {
    const payload = jwt.verify(token, this.secret) as JwtPayload;
    return { userId: payload.userId, deviceId: payload.deviceId };
  }
}
