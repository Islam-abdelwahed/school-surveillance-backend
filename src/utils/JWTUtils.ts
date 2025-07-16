import { env } from "../config/env";
import jwt, { JwtPayload } from "jsonwebtoken";
const ACCESS_TOKEN_TTL = "1h";
const REFRESH_TOKEN_TTL = "7d";

export class JWTUtils {
  constructor(private readonly secret: string = env.JWT_SECRET) {}

  generateAccessToken(userId: string,deviceId: string): string {
    return jwt.sign({ userId, deviceId }, this.secret, { expiresIn: ACCESS_TOKEN_TTL });
  }
  generateRefreshToken(userId: string, deviceId: string): string {
    return jwt.sign({ userId, deviceId }, this.secret, {
      expiresIn: REFRESH_TOKEN_TTL,
    });
  }

  verifyAccessToken(token: string): { userId: string; deviceId: string } {
    return this.verifyToken(token);
  }

  verifyRefreshToken(token: string): { userId: string; deviceId: string } {
    return this.verifyToken(token);
  }

  private verifyToken(token: string): { userId: string; deviceId: string } {
    try {
      const payload = jwt.verify(token, this.secret) as JwtPayload;

      if (!payload.userId || !payload.deviceId) {
        throw new Error("Invalid token payload");
      }

      return {
        userId: payload.userId,
        deviceId: payload.deviceId,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("TOKEN_EXPIRED");
      }
      throw new Error("INVALID_TOKEN");
    }
  }
}
