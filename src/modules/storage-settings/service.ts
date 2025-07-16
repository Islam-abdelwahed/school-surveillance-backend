import { IStorageConfigModel } from "./models/storage.config.model";
import { IStorageStatusModel } from "./models/storage.status.model";
import { eventEmitter } from "../../core/events/eventEnitter";
import si from "systeminformation";

export class StorageSettingsService {
  constructor(
    private storageConfigModel: IStorageConfigModel,
    private storageStatusModel: IStorageStatusModel
  ) {
    this.init();
  }

  private async init() {
    const configs = await this.storageConfigModel.find();
    if (configs.length < 1) {
      const config = this.storageConfigModel.build();
      await config.save();
    }
    const status = (await this.storageStatusModel.find())[0];
    if (!status) {
      const fsData = await si.fsSize();
      const rootFs = fsData.find((fs) => fs.mount === "/") || fsData[0];
      const status = this.storageStatusModel.build({
        config: configs[0].id,
        total_capacity_gb: rootFs.size,
        used_space_gb: rootFs.used,
        usage_Percentage: (rootFs.used / rootFs.size) * 100,
      });
      await status.save();
    }
  }

  async getConfig() {
    const config = (await this.storageConfigModel.find())[0];

    if (!config) {
      throw new Error("Storage status not found");
    }

    const { storage_path, auto_cleanup, retention } = config;

    return {
      retention,
      storage_path,
      auto_cleanup,
    };
  }

  async saveStorageStatus(attrs: {
    total_capacity_gb: number;
    used_space_gb: number;
    usage_Percentage: number;
    last_check: Date;
  }) {
    const status = await this.storageStatusModel.findOne();

    if (!status) {
      throw new Error("Storage status not found");
    }

    await status.updateOne(attrs);
  }

  async toggleAutoCleanup() {
    const config = await this.storageConfigModel.findOne();

    if (!config) {
      throw new Error("Storage status not found");
    }

    config.auto_cleanup.enabled = config.auto_cleanup.enabled ? false : true;
    await config.save();
    eventEmitter.emit("AUTO_CLEANUP_TOGGLED", config.auto_cleanup.enabled);
    return config.auto_cleanup.enabled;
  }

  async updateConfig(attrs: {
    storage_path?: string;
    auto_cleanup?: {
      enabled?: boolean;
      schedule?: string;
      last_run?: Date;
    };
  }) {
    const config = await this.storageConfigModel.findOne();

    if (!config) {
      throw new Error("Storage config not found");
    }

    await config.updateOne(attrs);

    return {};
  }

  async updateCleanupSchedule(schedule: string) {
    const config = await this.storageConfigModel.findOne();

    if (!config) {
      throw new Error("Storage status not found");
    }

    config.auto_cleanup.schedule = schedule;
    await config.save();

    eventEmitter.emit("SCHEDULE_UPDATED", config.auto_cleanup.schedule);
  }

  async getStatus() {
    const status = await this.storageStatusModel.findOne();

    if (!status) {
      throw new Error("Storage status not found");
    }

    const { total_capacity_gb, used_space_gb, last_check } = status;

    const total = Math.round(Number(total_capacity_gb) / 1024);
    const used = Math.round(Number(used_space_gb) / 1024);
    const available = Math.floor(total - used);
    if (isNaN(total) || isNaN(used)) {
      throw new Error("Invalid storage numbers");
    }
    const date = last_check?.toDateString()
    const percentage = Math.floor((used / total) * 100);
    return {
      total: total + "GB",
      used: used + "GB",
      available: available + "GB",
      last_check: date ,
      percentage: percentage  ,
    };
  }

  async getRetentionDays() {
    const config = await this.storageConfigModel.findOne();
    if (!config) {
      throw new Error("Storage config not found");
    }
    return config.retention;
  }

  async updateVideoRetention(retention: number) {
    const updatedConfig = await this.storageConfigModel.findOneAndUpdate(
      {},
      { $set: { retention } },
      { new: true } // Mongoose: old option name
    );

    if (!updatedConfig) {
      throw new Error("Storage config not found");
    }
    return updatedConfig.retention;
  }

  async updateStoragePath(path: string) {
    const updatedConfig = await this.storageConfigModel.findOneAndUpdate(
      {},
      { $set: { storage_path: path } },
      { new: true } // Mongoose: old option name
    );

    if (!updatedConfig) {
      throw new Error("Storage config not found");
    }
    return updatedConfig.storage_path;
  }
}
