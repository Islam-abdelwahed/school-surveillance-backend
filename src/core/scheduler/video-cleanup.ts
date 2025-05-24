import { Job, Queue, Worker } from "bullmq";
import { redisConfig } from "../../config/redis";
import { logger } from "../../utils/logger";
import { FileStorageService } from "../storage/storage";
import dbConfig from "../../config/db";
import { StorageService } from "../../modules/storage-settings/service";
import { VideoService } from "../../modules/video/service";

type CleanupJobData = {
  force?: boolean;
  initiatedBy?: "system" | "manual";
};

export class VideoCleanupService {
  constructor(
    private readonly queue: Queue<CleanupJobData>,
    private readonly fileStorageService: FileStorageService,
    private readonly storageConfigService: StorageService,
    private isShuttingDown = false,
    private readonly videoService: VideoService,
    private readonly worker: Worker<CleanupJobData>
  ) {
    queue = new Queue<CleanupJobData>("video-cleanup", {
      connection: redisConfig,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      },
    });

    worker = new Worker<CleanupJobData>(
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
  }

  public async initialize() {
    await dbConfig.connect();
    await this.scheduleCleanupJob();
    logger.info(`Video cleanup service initialized`);
  }

  private async scheduleCleanupJob() {
    const config = await this.storageConfigService.getConfig();
    if (!config?.auto_cleanup?.enabled) {
      logger.warn(`Auto cleanup disabled in system configuration`);
      return;
    }

    const jobs = await this.queue.getJobSchedulers();

    await Promise.all(
      jobs.map((job) => this.queue.removeJobScheduler(job.key))
    );

    await this.queue.add(
      "scheduled-cleanup",
      { initiatedBy: "system" },
      {
        repeat: {
          tz: "UTC",
          pattern: config.auto_cleanup.schedule,
        },
        jobId: "auto-cleanup",
        priority: 1,
      }
    );
  }

  private async performCleanup(force = false) {
    const query = force ? {} : { expires_at: { $lte: new Date() } };
    let deletedCount = 0;
    let failedDeletions = 0;
    const expiredVideos = await this.videoService.getExpiredVideos(query);

    for (const video of expiredVideos) {
      try {
        await this.fileStorageService.deleteFile(video.file_path);
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

  private async processJob(job: Job<CleanupJobData>) {
    if (this.isShuttingDown) {
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

  private async updateDeviceStatus(
    deleteCount: number,
    failedDeletions: number
  ) {}

  public async shutdown() {
    this.isShuttingDown = true;
    logger.info("Shutting down video cleanup service...");
    await this.worker.close();
    await this.queue.close();
    logger.info("Video cleanup service stopped");
  }
}
