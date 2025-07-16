import mongoose, { Schema, Types, Model, Document } from "mongoose";

interface VideoAttrs {
  camera_id: string;
  file_path: string;
  classroom: string;
  timestamps: string;
  detection: string;
  caption: string;
  model_used: Types.ObjectId;
  status: string;
  expires_at: Date;
}

export interface VideoDocument extends VideoAttrs, Document {
  _id: string;
  createAt: Date;
}

export interface IVideoModel extends Model<VideoDocument> {
  build(attrs: VideoAttrs): VideoDocument;
}

const VideoSchema = new Schema({
  camera_id: { type: String, required: true },
  classroom: { type: String, required: true },
  detection: { type: String, required: true },
  caption: { type: String, required: true },
  file_path: { type: String, required: true },
  timestamps: { type: Date, required: true },
  model_used: { type: Types.ObjectId, ref: "ai-model", required: true },
  status: { type: String, enum: ["active", "deleted"], default: "active" },
  expires_at: { type: Date, required: true },
});

VideoSchema.statics.build = (attrs: VideoAttrs) => {
  return new VideoModel(attrs);
};

const VideoModel = mongoose.model<VideoDocument, IVideoModel>(
  "video",
  VideoSchema
);

export default VideoModel;
