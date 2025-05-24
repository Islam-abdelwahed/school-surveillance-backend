import { NextFunction, Request, Response } from "express";
import { UserService } from "./service";

export class UsersController {
  constructor(private readonly userService: UserService) {}

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findUserById(req.params.id);
      res.status(200).json({ ...user });
    } catch (error) {
      res.status(400).json({ msg: "INVALID DATA" });
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, username } = req.body;
      const user = await this.userService.updateUserData(req.params.id, {
        email,
        username,
      });
      res.status(200).json({ ...user });
    } catch (error) {
      res.status(400).json({ msg: "INVALID DATA" });
    }
  }

  async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      await this.userService.deleteUser(req.params.id);

      res.status(204).json({ msg: "USER DELETED SUCCESSFULLY" });
    } catch (error) {
      res.status(400).json({ msg: "INVALID DATA" });
    }
  }
}
