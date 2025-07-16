import { Queue, Job, Worker } from "bullmq";
import { redisConfig } from "../../config/redis";
import { logger } from "../../utils/logger";
import { StorageSettingsService } from "../../modules/storage-settings/service";
import si from "systeminformation";

type StorageJobData = {
  fullscan?: boolean;
};

export class StorageMonitorService {
  private readonly queue: Queue<StorageJobData>;
  private readonly worker: Worker<StorageJobData>;
  private readonly STORAGE_THRESHOLD = 0.9;

  constructor(private readonly storageConfigService: StorageSettingsService) {
    this.queue = new Queue<StorageJobData>("storage-monitor", {
      connection: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        removeOnFail: true,
        removeOnComplete: true,
        backoff: { type: "exponential", delay: 10000 },
      },
    });

    this.worker = new Worker<StorageJobData>(
      "storage-monitor",
      this.processJob.bind(this),
      {
        connection: redisConfig,
        concurrency: 1,
        limiter: { max: 1, duration: 1000 },
      }
    );

    this.setupEventHandlers();
  }

  private async setupEventHandlers() {
    this.queue.on("error", (error) => {
      logger.error(`Storage-monitor Queue Error: ${error.message}`);
    });
    this.worker.on("completed", (job) => {
      logger.info(`Storage check ${job.id} completed`, job.returnvalue);
    });

    this.worker.on("failed", (job, error) => {
      logger.error(`Storage check ${job?.id} failed: ${error.message}`);
    });
    process.on("SIGTERM", async () => {
      await this.shutdown();
    });

    process.on("SIGINT", async () => {
      await this.shutdown();
    });
  }

  public async initialize() {
    await this.scheduleCleanupJob();
    logger.info(`Storage monitoring service initialized`);
  }

  private async scheduleCleanupJob() {
    await this.removeScheduledJobs();

    await this.queue.add(
      "periodic-storage-check",
      {},
      {
        repeat: { pattern: "*/15 * * * *", tz: "UTC" },
        jobId: "periodic-storage-check",
        priority: 2,
      }
    );
  }

  private async processJob(job: Job<StorageJobData>) {
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

  private async removeScheduledJobs() {
    try {
      const schedulers = await this.queue.getJobSchedulers();
      await Promise.all(
        schedulers.map((scheduler) =>
          this.queue.removeJobScheduler(scheduler.key)
        )
      );
      logger.info("Removed all scheduled cleanup jobs");
    } catch (error) {
      logger.error("Failed to remove scheduled jobs", error);
    }
  }
  private async shutdown() {
    logger.info("Shutting down storage monitor...");
    await this.removeScheduledJobs();
    await this.worker.close();
    await this.queue.close();
    logger.info("Storage monitor stopped");
  }
}
