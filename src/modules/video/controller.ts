import { NextFunction, Request, Response } from "express";
import { VideoService } from "./service";
import { FileStorageService } from "../../core/storage/storage";

export class VideoController {
  constructor(
    private readonly videoSrevice: VideoService,
    private readonly fileStorageService: FileStorageService
  ) {}

  async getVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const video = await this.videoSrevice.findVideoById(req.params.id);
      res.status(200).json({ ...video });
    } catch (error) {
      next(error);
    }
  }
  async deleteVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const video = await this.videoSrevice.deleteVideoById(req.params.id);
      await this.fileStorageService.deleteFile(video.file_path);
      res.status(204).json({ message: "Video Deleted Successfully" });
    } catch (error) {
      next(error);
    }
  }

  async getVideos(req: Request, res: Response, next: NextFunction) {
    try {
      const videos = await this.videoSrevice.getAllVideos();
      res.status(200).json({ ...videos });
    } catch (error) {
      next(error);
    }
  }

  async streamVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const range = req.headers.range;
      const { headers, stream } = await this.videoSrevice.getVideoStream(
        req.params.id,
        range
      );
      res.writeHead(range ? 206 : 200, headers);
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  async storeVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const video = await this.videoSrevice.processVideoUpload(
       req.file,{
          description: req.body.description,
          detectionData: req.body.detectionData,
        },
      );
    } catch (error) {
      next(error);
    }
  }
}
