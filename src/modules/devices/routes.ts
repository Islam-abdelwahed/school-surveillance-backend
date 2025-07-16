import express from "express";
import {registerDeviceSchema} from './schema'
import {requestValidation} from '../../middleware/validation'
import {DeviceController} from "./controller";

export const deviceRoutes = (deviceController:DeviceController) => {
  const router = express.Router();

  router.post("/register",requestValidation(registerDeviceSchema),deviceController.register.bind(deviceController));

  router.get("/",deviceController.listDevices.bind(deviceController));

  router.get("/:deviceId/revoke",deviceController.revoke.bind(deviceController));

  return router 
};
