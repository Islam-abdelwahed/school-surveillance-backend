import e, { Request, Response, NextFunction } from "express";
import { AuthService } from "./service";
import { logger } from "../../utils/logger";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async signup(req: Request, res: Response) {
    try {
      const { email, username, password, deviceName, publicKey } = req.body;

      const result = await this.authService.registerUser({
        email,
        username,
        password,
        device: { name: deviceName, publicKey },
      });


      res.status(201).json({ ...result });
    } catch (error: any) {
      res.status(400).json({ msg: `Signup failed: ${error.message}` });
    }
  }

  async login(req: Request, res: Response) {
    try {
      logger.warn("Shehab reached")
      const { email, password, deviceId } = req.body;
      const result = await this.authService.loginWithDevice({
        email,
        password,
        deviceId,
      });
      res.status(200).json({ ...result });
    } catch (error: any) {
      res.status(400).json({ msg: `Login Failed: ${error.message}` });
    }
  }
  async logout(req: Request, res: Response) {
    try {
      res.status(201).json({});
    } catch (error) {}
  }
  async refresh(req: Request, res: Response) {
    try {
      const authHeader =  req.headers?.authorization;

      const token = authHeader?.split(' ')[1];
      if(!token) throw new Error(); 
      const result = await this.authService.refreshToken(token)
      res.status(201).json({...result});
    } catch (error) {}
  }
}