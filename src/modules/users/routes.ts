import { Router } from "express";
import { UsersController } from "./controller";

export const usersRoutes = (controller: UsersController) => {
  const router = Router();

  router
    .route("/:id")
    .get(controller.getProfile.bind(controller))
    .patch(controller.updateProfile.bind(controller))
    .delete(controller.deleteProfile.bind(controller));

  return router;
};
