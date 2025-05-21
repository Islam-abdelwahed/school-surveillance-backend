import { Request, Response } from "express";
import { UserService } from "./service";

export class UsersController {
  constructor(private readonly userService: UserService) {}

  async getProfile(req: Request, res: Response) {
    try {
      res.status(201).json({});
    } catch (error) {}
  }

  async updateProfile(req: Request, res: Response) {
    try {
      res.status(201).json({});
    } catch (error) {}
  }
  async deleteProfile(req: Request, res: Response) {
    try {
      res.status(201).json({});
    } catch (error) {}
  }
}
