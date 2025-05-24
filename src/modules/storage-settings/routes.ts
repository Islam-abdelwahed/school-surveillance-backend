import { Router } from "express";
import { StorageController } from "./controller";

export const storageRoutes = (storageController: StorageController) => {
  const router = Router();

  router
    .route("/")
    .get(storageController.getFullConfig.bind(this))
    .patch(storageController.partialUpdateConfig.bind(this));


  router.patch(
    "//cleanup/enable",
    storageController.toggleCleanup.bind(this)
  );
  router.patch(
    "//retention",
    storageController.updateRetention.bind(this)
  );
  router.patch(
    "//storage-path",
    storageController.updateStoragePath.bind(this)
  );


  router.get("/status", storageController.getStorageStatus.bind(this));

  return router;
};
