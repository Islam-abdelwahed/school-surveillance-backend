import { Request, Response, NextFunction } from "express";
import multer from "multer";

export default function uploadMiddleware() {
  return (req: Request, res: Response, next: NextFunction) =>
    multer({ storage: multer.memoryStorage() }).single("video");
}
