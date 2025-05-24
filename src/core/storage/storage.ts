import { logger } from "../../utils/logger";
import path from "path";
import fs from "fs/promises";

export interface IStorageService {
  deleteFile(path: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
  saveFile(fileName: string, buffer: Buffer): Promise<string>;
  getAvailableSpace(): Promise<number>;
}

export class FileStorageService implements IStorageService {
  constructor(private readonly basePath = "/videos") {}

  async deleteFile(filePath: string): Promise<void> {
    const absolutePath = path.resolve(this.basePath, filePath);

    try {
      await fs.access(absolutePath);
      await fs.unlink(absolutePath);
      logger.info(`successfully deleted file: ${absolutePath}`);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        logger.warn(`File not found during deletetion: ${absolutePath}`);
      }
      logger.error(
        `Failed to delete the file ${absolutePath} : ${error.message}`
      );
      throw new Error(`File deletetion failed: ${error.message}`);
    }
  }

  async saveFile(fileName: string, buffer: Buffer): Promise<string> {
    try {
      const filePath = path.resolve(this.basePath, fileName);
      await fs.writeFile(filePath, buffer);
      return filePath;
    } catch (error: any) {
      logger.error(`failed to save file ${fileName} : ${error.message}`);
      throw new Error(`FIle saving Failed: ${error.message}`);
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(path.resolve(this.basePath, filePath));
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAvailableSpace(): Promise<number> {
    const stats = await fs.statfs(this.basePath);
    return stats.bsize * stats.bavail;
  }
}
