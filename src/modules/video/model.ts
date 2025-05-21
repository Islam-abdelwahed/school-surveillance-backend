import mongoose, { Schema, Types } from "mongoose";

interface VideoAttrs {
  camera_id: string;
  file_path: string;
  timestamps: Date;
  model_used: Types.ObjectId;
  status: string;
}

interface Model extends mongoose.Model<VideoDocument> {
  build(attrs: VideoAttrs): VideoDocument;
}

interface VideoDocument extends VideoAttrs, mongoose.Document {
  _id: string;
  createAt:Date;
}

const VideoSchema = new Schema({
  camera_id: { type: String, required: true },
  file_path: { type: String, required: true },
  timestamps: { type: Date, required: true },
  model_used: { type: Types.ObjectId, ref: "ai-model", required: true },
  status: { type: String, enum: ["active", "deleted"], default: "active" },
});

VideoSchema.statics.build = (attrs: VideoAttrs) => {
  return new VideoModel(attrs);
};

export const VideoModel = mongoose.model<VideoDocument, Model>(
  "video",
  VideoSchema
);
