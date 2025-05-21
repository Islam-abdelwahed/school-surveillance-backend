import { Request, Response, NextFunction } from "express";
import { AuthService } from "./service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async signup(req: Request, res: Response) {
    try {
      const { email, username, password, deviceName, publicKey } = req.body;

      const result = this.authService.registerUser({
        email,
        username,
        password,
        device: { name: deviceName, publicKey },
      });

      res.status(201).json({...result});
    } catch (error) {
      throw new Error("dd");
    }
  }

  async login(req: Request, res: Response) {
    try {
      res.status(201).json({});
    } catch (error) {}
  }
  async logout(req: Request, res: Response) {
    try {
      res.status(201).json({});
    } catch (error) {}
  }
  async refresh(req: Request, res: Response) {
    try {
      res.status(201).json({});
    } catch (error) {}
  }
}
