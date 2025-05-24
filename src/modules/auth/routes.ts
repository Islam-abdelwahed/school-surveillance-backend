import express from "express";
import { AuthController } from "./controller";
import { requestValidation } from "../../middleware/validation";
import { registerSchema, loginSchema } from "./schemas";

export const authRoutes = (authController: AuthController) => {
  const router = express.Router();

  router.post(
    "/signup",
    requestValidation(registerSchema),
    authController.signup.bind(authController)
  );

  router.post(
    "/login",
    requestValidation(loginSchema),
    authController.login.bind(authController)
  );

  router.get(
    "/logout",

    authController.logout.bind(authController)
  );

  router.post("/refresh", authController.refresh.bind(authController));

  return router;
};
