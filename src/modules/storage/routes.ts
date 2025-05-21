import { Router } from "express";
import { StorageController } from "./controller";

const storageRoutes = (storageController: StorageController) => {
  const router = Router();

  router
    .route("/config")
    .get(storageController.getFullConfig.bind(this))
    .patch(storageController.partialUpdateConfig.bind(this));


  router.patch(
    "/config/cleanup/enable",
    storageController.toggleCleanup.bind(this)
  );
  router.patch(
    "/config/retention",
    storageController.updateRetention.bind(this)
  );
  router.patch(
    "/config/storage-path",
    storageController.updateStoragePath.bind(this)
  );


  router.get("/status", storageController.getStorageStatus.bind(this));

  return router;
};
