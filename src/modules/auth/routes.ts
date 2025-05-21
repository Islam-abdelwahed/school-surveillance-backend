import express from "express";
import { AuthController } from "./controller";
import { requestValidation } from "../../middleware/validation";
import { registerSchema ,loginSchema } from './schemas';

export const authRoutes = (authController: AuthController) => {
  const router = express.Router();

  router.post(
    "/auth/signup",
    requestValidation(registerSchema),
    authController.signup.bind(authController)
  );

  router.post(
    "/auth/login",
    requestValidation(loginSchema),
    authController.login.bind(authController)
  );

  router.get(
    "/auth/logout",
    
    authController.logout.bind(authController)
  );

  router.post(
    "/auth/refresh",
    authController.refresh.bind(authController)
  );

  return router;
};
