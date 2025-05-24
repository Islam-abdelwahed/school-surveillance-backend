import mongoose, { Schema, Types, Model, Document } from "mongoose";

interface VideoAttrs {
  camera_id: string;
  file_path: string;
  timestamps: Date;
  model_used: Types.ObjectId;
  status: string;
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
  file_path: { type: String, required: true },
  timestamps: { type: Date, required: true },
  model_used: { type: Types.ObjectId, ref: "ai-model", required: true },
  status: { type: String, enum: ["active", "deleted"], default: "active" },
});

VideoSchema.statics.build = (attrs: VideoAttrs) => {
  return new VideoModel(attrs);
};

const VideoModel = mongoose.model<VideoDocument, IVideoModel>(
  "video",
  VideoSchema
);

export default VideoModel;
