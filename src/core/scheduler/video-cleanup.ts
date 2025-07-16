import { Job, Queue, Worker } from "bullmq";
import { redisConfig } from "../../config/redis";
import { logger } from "../../utils/logger";
import { StorageSettingsService } from "../../modules/storage-settings/service";
import { VideoService } from "../../modules/video/service";
import { eventEmitter } from "../events/eventEnitter";

type CleanupJobData = {
  force?: boolean;
  initiatedBy?: "system" | "manual";
};

export class VideoCleanupService {
  private readonly queue: Queue<CleanupJobData>;
  private autoCleanupEnabled = true;
  private cleanupSchedule = "0 3 * * *";
  private readonly worker: Worker<CleanupJobData>;

  constructor(
    private readonly storageSettingsService: StorageSettingsService,
    private readonly videoService: VideoService
  ) {
    this.queue = new Queue<CleanupJobData>("video-cleanup", {
      connection: redisConfig,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: { type: "exponential", delay: 10000 },
      },
    });

    this.worker = new Worker<CleanupJobData>(
      "video-cleanup",
      this.processJob.bind(this),
      {
        connection: redisConfig,
        concurrency: 1,
        limiter: { max: 1, duration: 1000 },
      }
    );

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.queue.on("error", (error) => {
      logger.error(`VideoCleanup Queue Error: ${error.message}`);
    });

    this.worker.on("completed", (job) => {
      logger.info(`cleanup job ${job.id} completed`, job.returnvalue);
    });

    this.worker.on("failed", (job, error) => {
      logger.error(`Cleanup job ${job?.id} failed: ${error.message}`);
    });
    eventEmitter.on("SCHEDULE_UPDATED", async (schedule) => {
      this.cleanupSchedule = schedule;
      await this.scheduleCleanupJob();
    });
    eventEmitter.on("AUTO_CLEANUP_TOGGLED", async (auto) => {
      this.autoCleanupEnabled = auto;
      if (this.autoCleanupEnabled) {
        logger.info("Video cleanup service start");
        await this.scheduleCleanupJob();
      } else {
        logger.info("Video cleanup service stopped");
        await this.removeScheduledJobs();
      }
    });
    process.on("SIGTERM", async () => {
      await this.shutdown();
    });

    process.on("SIGINT", async () => {
      await this.shutdown();
    });
  }

  public async initialize() {
    // await dbConfig.connect();

    await this.loadConfigFromDatabase();

    await this.scheduleCleanupJob();
    logger.info(`Video cleanup service initialized`);
  }

  private async loadConfigFromDatabase() {
    try {
      const config = await this.storageSettingsService.getConfig();
      this.autoCleanupEnabled = config?.auto_cleanup?.enabled || false;
      this.cleanupSchedule = config?.auto_cleanup?.schedule || "0 3 * * *";
      logger.info(`Video cleanup: Config is loaded ${this.cleanupSchedule}`);
    } catch (error) {
      logger.error("Failed to load storage config from database", error);
    }
  }

  private async scheduleCleanupJob() {
    if (!this.autoCleanupEnabled) {
      logger.warn(`Skiping cleanup job - service shutting down`);
      return;
    }

    await this.removeScheduledJobs();
    logger.warn(`schedule: ${this.cleanupSchedule}`);
    await this.queue.add(
      "scheduled-cleanup",
      { initiatedBy: "system" },
      {
        repeat: {
          tz: "UTC",
          pattern: this.cleanupSchedule,
        },
        jobId: "auto-cleanup",
        priority: 1,
      }
    );
  }

  private async processJob(job: Job<CleanupJobData>) {
    if (!this.autoCleanupEnabled) {
      logger.warn(`Skiping cleanup job - service shutting down`);
      return;
    }

    const startTime = Date.now();
    logger.info(`starting cleanup job ${job.id}`, job.data);

    try {
      const { deletedCount, failedDeletions } = await this.performCleanup(
        job.data.force
      );

      await this.updateDeviceStatus(deletedCount, failedDeletions);

      return {
        jobId: job.id,
        duration: Date.now() - startTime,
        deletedCount,
        failedDeletions,
      };
    } catch (error: any) {
      logger.error(`Cleanup job ${job.id} failed: ${error.message}`, error);
      throw error;
    }
  }

  private async performCleanup(force = false) {
    const query = force ? {} : { expires_at: { $lte: new Date() } };
    let deletedCount = 0;
    let failedDeletions = 0;
    const expiredVideos = await this.videoService.getExpiredVideos(query);
    logger.warn(`Start Cleaning Process: ${expiredVideos.length}`);
    for (const video of expiredVideos) {
      try {
        await this.videoService.deleteVideoById(video.id);
        deletedCount++;
      } catch (error: any) {
        failedDeletions++;
        logger.error(`Failed to delete video ${video.id}: ${error.message}`, {
          videoId: video.id,
          error,
        });
      }
    }

    return { deletedCount, failedDeletions };
  }

  private async updateDeviceStatus(
    deleteCount: number,
    failedDeletions: number
  ) {}

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

  public async shutdown() {
    logger.info("Shutting down video cleanup service...");
    try {
      await this.removeScheduledJobs();
      await this.worker.close();
      await this.queue.close();
      logger.info("Video cleanup service stopped");
    } catch (error) {
      logger.error("Error during shutdown", error);
    }
  }
}
