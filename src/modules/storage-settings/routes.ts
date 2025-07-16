import { Router } from "express";
import { StorageController } from "./controller";

export const storageRoutes = (storageController: StorageController) => {
  const router = Router();

  router
    .route("/config")
    .get(storageController.getFullConfig.bind(storageController))
    .patch(storageController.partialUpdateConfig.bind(storageController));


  router.patch(
    "/config/cleanup-toggle",
    storageController.toggleCleanup.bind(storageController)
  );
  router.patch(
    "/config/retention",
    storageController.updateRetention.bind(storageController)
  );
  router.patch(
    "/config/storage-path",
    storageController.updateStoragePath.bind(storageController)
  );

  router.get("/status", storageController.getStorageStatus.bind(storageController));

  return router;
};
