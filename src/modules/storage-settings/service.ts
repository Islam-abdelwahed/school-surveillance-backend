import StorageConfigModel from "./models/storage.config.model";
import StorageStatusModel from "./models/storage.status.model";

export class StorageService {
  constructor(
    private storageConfigModel: typeof StorageConfigModel,
    private storageStatusModel: typeof StorageStatusModel
  ) {}

  async getConfig() {
    const config = await this.storageConfigModel.findOne();

    if (!config) {
      throw new Error("Storage status not found");
    }

    const { storage_path, auto_cleanup } = config;

    return {
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
      throw new Error("Storage status not found");
    }

    await config.updateOne(attrs);

    return {};
  }

  async updateCleanupSchedule() {}

  async getStatus() {
    const status = await this.storageStatusModel
      .findOne()
      .populate("storageConfig");

    if (!status) {
      throw new Error("Storage status not found");
    }

    const { total_capacity_gb, used_space_gb, last_check, storage_config } =
      status;

    const { storage_path, auto_cleanup } = storage_config;

    return {
      total_capacity_gb,
      used_space_gb,
      last_check,
      storage_path,
      auto_cleanup,
    };
  }
}
