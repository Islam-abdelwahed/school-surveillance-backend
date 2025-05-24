import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";

// Configure allowed file types
const allowedMimeTypes = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska"
];

// File validation function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only video files are allowed"));
  }
};

// Configure multer upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB limit
    files: 1 // Single file upload
  },
  fileFilter
});

// Middleware wrapper
export const uploadMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Execute the multer middleware
    upload.single("video")(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({
          error: err.message || "File upload failed"
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          error: "No video file provided"
        });
      }

      next();
    });
  };
};