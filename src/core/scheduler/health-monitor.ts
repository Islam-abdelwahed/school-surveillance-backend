import { Queue, Job, Worker } from "bullmq";
import { redisConfig } from "../../config/redis";
import { logger } from "../../utils/logger";
import { StorageConfigService } from "../../modules/storage/service";
import si from "systeminformation";

type StorageJobData = {
  fullscan?: boolean;
};

export class StorageMonitorService {
  constructor(
    private queue: Queue<StorageJobData>,
    private worker: Worker<StorageJobData>,
    private isShuttingDown = false,
    private readonly storageConfigService: StorageConfigService,
    private readonly STORAGE_THRESHOLD = 0.9
  ) {
    this.queue = new Queue<StorageJobData>("storage-monitor", {
      connection: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        removeOnFail: true,
        removeOnComplete: true,
      },
    });

    this.worker = new Worker<StorageJobData>(
      "storage-monitor",
      this.processJob.bind(this),
      { connection: redisConfig }
    );

    this.setupEventHandlers();
  }

  private async setupEventHandlers() {
    this.worker.on("completed", (job) => {
      logger.info(`Storage check ${job.id} completed`, job.returnvalue);
    });

    this.worker.on("failed", (job, error) => {
      logger.error(`Storage check ${job?.id} failed: ${error.message}`);
    });
  }

  private async initialize() {
    await this.scheduleCleanupJob();
    logger.info(`Storage monitoring service initialized`);
  }

  private async scheduleCleanupJob() {
    await this.queue.add(
      "periodic-storage-check",
      {},
      {
        repeat: { pattern: "*/15 * * * *", tz: "UTC" },
        jobId: "periodic-storage-check",
      }
    );
  }

  private async processJob(job: Job<StorageJobData>) {
    if (!this.isShuttingDown) {
      logger.warn(`Skipping storage check - service shutting down`);
      return;
    }

    const startTime = Date.now();
    logger.info(`Storage Check failed: ${job.id}`);

    try {
      const storageMetrics = await this.collectStorageMetrics();
      await this.storageConfigService.saveStorageStatus(storageMetrics);
      await this.checkStorageThresholds(storageMetrics);
      return {
        duration: startTime - Date.now(),
        metrics: storageMetrics,
      };
    } catch (error: any) {
      logger.error(`Storage check failed: ${error.message}`, error);
      throw error;
    }
  }

  private async checkStorageThresholds(metrics: any) {
    const usage = metrics.used / metrics.total;

    if (usage > this.STORAGE_THRESHOLD) {
      const message = `Storage threshold exceeded: ${Math.round(
        usage * 100
      )}% used`;
      logger.warn(message);
      // await this.triggerStorageAlert(message);
    }
  }

  private async collectStorageMetrics() {
    try {
      const fsData = await si.fsSize();
      const rootFs = fsData.find((fs) => fs.mount === "/") || fsData[0];

      if (!rootFs) {
        throw new Error("No filesystem found for monitoring");
      }

      return {
        last_check: new Date(),
        total_capacity_gb: rootFs.size,
        used_space_gb: rootFs.used,
        available: rootFs.available,
        usage_Percentage: (rootFs.used / rootFs.size) * 100,
      };
    } catch (error) {
      logger.error("Failed to collect storage metrics:", error);
      throw error;
    }
  }

  private async shutdown() {
    this.isShuttingDown = true;
    logger.info("Shutting down storage monitor...");
    await this.worker.close();
    await this.queue.close();
    // await this.scheduler.close();
    logger.info("Storage monitor stopped");
  }
}
