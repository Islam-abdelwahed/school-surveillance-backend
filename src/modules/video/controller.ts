import { NextFunction, Request, Response } from "express";
import { IVideoService } from "./service";

export class VideoController {
  constructor(private readonly videoService: IVideoService) {}

  async getVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const video = await this.videoService.findVideoById(req.params.id);
      res.status(200).json({ ...video });
    } catch (error: any) {
      res.status(400).json({ msg: `ERROR:  ${error.message}` });
    }
  }
  async deleteVideo(req: Request, res: Response, next: NextFunction) {
    try {
      await this.videoService.deleteVideoById(req.params.id);
      // delete video by FileStorageService
      res.status(204).json({ message: "Video Deleted Successfully" });
    } catch (error: any) {
      res.status(400).json({ msg: `ERROR:  ${error.message}` });
    }
  }

  async getVideos(req: Request, res: Response, next: NextFunction) {
    try {
      const videos = await this.videoService.getAllVideos();
      res.status(200).json(videos);
    } catch (error: any) {
      res.status(400).json({ msg: `ERROR:  ${error.message}` });
    }
  }

  async streamVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const range = req.headers["content-range"];
      const { headers, stream } = await this.videoService.getVideoStream(
        req.params.id,
        range
      );
      res.writeHead(range ? 206 : 200, headers);
      stream.pipe(res);
    } catch (error: any) {
      res.status(400).json({ msg: `ERROR:  ${error.message}` });
    }
  }

  async storeVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const video = await this.videoService.processVideoUpload(
        req.file!,
        
      );
      // store video by FileStorageService
      res.status(202).json({ msg: "VIDEO UPLOADED", video });
    } catch (error: any) {
      // next(error:any);
      res.status(400).json({ msg: `VIDEO NOT UPLOADED: ${error.message}` });
    }
  }
}
