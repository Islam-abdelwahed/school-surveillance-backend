import { Router } from "express";
import { VideoController } from "./controller";
import uploadMiddleware from "../../middleware/upload";

export const videoRoutes = (videoController: VideoController) => {
  const router = Router();

  router
    .route("/:id")
    .get(videoController.getVideo.bind(this))
    .delete(videoController.deleteVideo.bind(this));

  router.get("/", videoController.getVideos.bind(this));

  router.get("/stream/:id", videoController.streamVideo.bind(this));

  router.post("/store-video",uploadMiddleware,videoController.storeVideo.bind(this));

  return router;
};
