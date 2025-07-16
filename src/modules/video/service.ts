import { Types } from "mongoose";
import { IVideoModel } from "./model";
import path from "path";
import fs from "fs";
import { IStorageService } from "../../core/storage/storage";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../../utils/logger";
import { StorageSettingsService } from "../storage-settings/service";
import { EventBus } from "../../core/events/event-bus";

export interface IVideoService {
  getAllVideos(): Promise<any>;
  findVideoById(id: string): Promise<any>;
  deleteVideoById(id: string): Promise<void>;
  getVideoStream(id: string, range?: string): Promise<any>;
  processVideoUpload(file: Express.Multer.File): Promise<any>;
}

export class VideoService implements IVideoService {
  constructor(
    private readonly storageSettingsService: StorageSettingsService,
    private readonly videoModel: IVideoModel,
    private readonly fileStorageService: IStorageService,
    private readonly eventBus: EventBus
  ) {}

  async getExpiredVideos(query: { expires_at?: object }) {
    const videos = await this.videoModel.find(query);

    return videos.map((video) => {
      return { id: video._id, file_path: video.file_path };
    });
  }

  async findVideoById(videoId: string) {
    const video = await this.videoModel.findById(videoId);

    if (!video) {
      throw new Error("Video isn't found");
    }

    const { camera_id, file_path, timestamps, model_used, status } = video;

    return { camera_id, file_path, timestamps, model_used, status };
  }

  async getAllVideos() {
    const videos = await this.videoModel.find();
    const list = videos.map((v) => {
      return {
        id: v._id,
        date: v.timestamps,
        teacher: "ljkgh",
        student: "xljxg",
        class: v.classroom,
        event: v.detection,
        level: "3",
      };
    });

    return list;
  }

  async deleteVideoById(videoId: string) {
    const video = await this.videoModel.findByIdAndDelete(videoId);
    if (!video) {
      throw new Error("Video isn't found");
    }
    await this.fileStorageService.deleteFile(video.file_path);
  }

  async getVideoStream(videoId: string, range?: string) {
    const video = await this.videoModel.findById(videoId);

    if (!video) {
      throw new Error("Video not found");
    }

    const videoPath = path.resolve("./", video.file_path);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    if (!range) {
      return {
        headers: {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        },
        stream: fs.createReadStream(videoPath),
        fileSize,
      };
    }

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;
    logger.warn("range");
    return {
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Range": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      },
      stream: fs.createReadStream(videoPath, { start, end }),
      fileSize: chunkSize,
    };
  }

  async processVideoUpload(file: Express.Multer.File) {
    try {
      const availableSpace = await this.fileStorageService.getAvailableSpace();
      if (availableSpace < file.size) {
        throw new Error("No available space");
      }

      const fileExt = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExt}`;

      const filePath = await this.fileStorageService.saveFile(
        filename,
        file.buffer
      );

      const retentionDays =
        await this.storageSettingsService.getRetentionDays();
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + retentionDays);

      const video = this.videoModel.build({
        file_path: filePath,
        timestamps: new Date().toISOString(),
        camera_id: "32",
        classroom: "class-1",
        detection: "Physical abuse",
        caption: "A teacher is seen holding student's ear, and hitting him",
        model_used: new Types.ObjectId(),
        status: "active",
        expires_at,
      });

      await video.save();
      const { camera_id, file_path, timestamps, model_used, status } = video;

      await this.eventBus.publish("video_processed", {
        userId: "123456",
        title: video.detection,
        message:video.caption,
        time: video.timestamps
      });

      return {
        camera_id,
        file_path,
        timestamps,
        model_used,
        status,
      };
    } catch (error: any) {
      logger.error("error here");
      throw new Error(error.message);
    }
  }
}
