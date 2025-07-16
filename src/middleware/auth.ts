import { Response, Request, NextFunction } from "express";
import { JWTUtils } from "../utils/JWTUtils";

declare global {
  namespace Express {
    interface Request {
      context?: {
        userId: string;
        deviceId: string;
      };
    }
  }
}

export function authGuard(jwt: JWTUtils) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const token = authHeader.split(" ")[1];

      const payload = jwt.verifyAccessToken(token);
      if (!payload) {
        res.status(401).json({ message: "Invalid Token" });
        return;
      }

      req.context = {
        userId: payload.userId,
        deviceId: payload.deviceId,
      };
      next();
    } catch (error:any) {
      res.status(401).json({ message: `Authentication failed:${error.message}` });
      return;
    }
  };
}
