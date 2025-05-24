import { Router } from "express";
import { VideoController } from "./controller";
import { uploadMiddleware } from "../../middleware/upload";

export const videoRoutes = (videoController: VideoController) => {
  const router = Router();

  router
    .route("/:id")
    .get(videoController.getVideo.bind(videoController))
    .delete(videoController.deleteVideo.bind(videoController));

  router.get("/", videoController.getVideos.bind(videoController));

  router.get("/stream/:id", videoController.streamVideo.bind(videoController));

  router.post(
    "/store-video",
    uploadMiddleware(),
    videoController.storeVideo.bind(videoController)
  );

  return router;
};
