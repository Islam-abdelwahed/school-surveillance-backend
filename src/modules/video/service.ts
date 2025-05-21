import { Types } from "mongoose";
import { VideoModel } from "./model";
import path from "path";
import fs from "fs";
import { FileStorageService } from "../../core/storage/storage";
import { v4 as uuidv4 } from "uuid";

interface videoDTO {
  camera_id: string;
  file_path: string;
  timestamps: Date;
  model_used: Types.ObjectId;
  status: string;
}

export class VideoService {
  constructor(
    private readonly videoModel: typeof VideoModel,
    private readonly fileStorageService: FileStorageService
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
    const videos = await this.videoModel.find().populate("ai-model");
    return videos;
  }

  async deleteVideoById(videoId: string) {
    const video = await this.videoModel.findByIdAndDelete(videoId);
    if (!video) {
      throw new Error("Video isn't found");
    }
    const { _id, file_path } = video;
    return { id: _id, file_path };
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

    return {
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Range": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
        "HTTP/1.1": "206 Partial Content",
      },
      stream: fs.createReadStream(videoPath, { start, end }),
      fileSize: chunkSize,
    };
  }

  async processVideoUpload(file: any, attrs: {}) {
    try {
      const availableSpace = await this.fileStorageService.getAvailableSpace();
      if (availableSpace < file.size) {
        throw new Error("No available space");
      }

      const fileExt = path.extname(file.orginalname);
      const filename = `${uuidv4()}${fileExt}`;

      const filePath = await this.fileStorageService.saveFile(
        filename,
        file.buffer
      );

      const video = this.videoModel.build({
        file_path: filePath,
        timestamps: new Date(),
        camera_id: "",
        model_used: new Types.ObjectId("s"),
        status: "",
      });
      await video.save();
      const { camera_id, file_path, timestamps, model_used, status } = video;

      return {
        camera_id,
        file_path,
        timestamps,
        model_used,
        status,
      };
    } catch (error) {}
  }
}
