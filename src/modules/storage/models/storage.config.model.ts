import mongoose, { Schema } from "mongoose";

interface StorageConfigAttrs {
  storage_path: string;
  auto_cleanup: {
    enabled: boolean;
    schedule: string;
    last_run: Date;
  };
}

interface StorageConfigDocument extends StorageConfigAttrs,mongoose.Document
{

}

interface Model extends mongoose.Model<StorageConfigDocument> {
  build(attrs: StorageConfigAttrs): StorageConfigDocument;
}

const StorageConfigSchema = new Schema({
  storage_path: { type: String, default: "/var/video_storage" },
  auto_cleanup: {
    enabled: { type: Boolean, default: true },
    schedule: { type: String, default: "0 3 * * *" },
    last_run: { type: Date },
  },
});

StorageConfigSchema.statics.build = (attrs: StorageConfigAttrs) => {
  return new StorageConfigModel(attrs);
};

const StorageConfigModel = mongoose.model<StorageConfigDocument,Model>(
  "storageConfig",
  StorageConfigSchema
);

export default StorageConfigModel;
