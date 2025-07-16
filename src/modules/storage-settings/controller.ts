import { StorageSettingsService } from "./service";
import { Request, Response, NextFunction } from "express";

export class StorageController {

  constructor(private readonly storageConfigService: StorageSettingsService) {}

  async getFullConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await this.storageConfigService.getConfig();

      res.status(200).json({ ...config });
    } catch (error) {
      next(error);
    }
  }

  async partialUpdateConfig(req: Request, res: Response, next: NextFunction) {
    try {
      await this.storageConfigService.updateConfig({...req.body});
      res.status(201).json({});
    } catch (error) {
      next(error);
    }
  }

  async toggleCleanup(req: Request, res: Response, next: NextFunction) {
    try {
      const auto_cleanup = await this.storageConfigService.toggleAutoCleanup();
      res.status(200).json({ auto_cleanup });
    } catch (error) {
      next(error);
    }
  }

  async updateRetention(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.storageConfigService.updateVideoRetention(req.body.retention);
      res.status(200).json({retention:result});
    } catch (error) {
      next(error);
    }
  }

  async updateStoragePath(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.storageConfigService.updateStoragePath(req.body.path);
      res.status(201).json({result});
    } catch (error) {
      next(error);
    }
  }

  async getStorageStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await this.storageConfigService.getStatus();
      res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }
}
