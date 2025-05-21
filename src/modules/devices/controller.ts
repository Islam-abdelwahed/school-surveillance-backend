import { Request, Response } from "express";
import { DeviceService } from "./service";

export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  async register(req: Request, res: Response) {
    try {
      const { userId, publicKey, deviceName } = req.body;
      const result = this.deviceService.registerDevice({
        userId,
        publicKey,
        deviceName,
      });

      res.status(200).json({ result });
    } catch (error) {}
  }

  async listDevices(req: Request, res: Response) {
    try {
      const userId ="dsa"// req.user!.userid;
      this.deviceService.listUserDevices(userId);

      res.status(200).json({});
    } catch (error) {}
  }

  async revoke(req: Request, res: Response) {
    try {
      res.status(200).json({});
    } catch (error) {}
  }
}
