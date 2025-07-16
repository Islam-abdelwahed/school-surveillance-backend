import mongoose, { Types,Schema, Document, Model } from "mongoose";

export interface StorageConfigAttrs {
  storage_path: string;
  retention: number;
  auto_cleanup: {
    enabled: boolean;
    schedule: string;
    last_run?: Date;
  };
}

export interface StorageConfigDocument extends StorageConfigAttrs, Document {
  _id: Types.ObjectId;
}

export interface IStorageConfigModel extends Model<StorageConfigDocument> {
  build(attrs?: StorageConfigAttrs): StorageConfigDocument;
}

const StorageConfigSchema = new Schema({
  storage_path: { type: String, default: "/videos" },
  retention: { type: Number, required: true, default: 7 },
  auto_cleanup: {
    enabled: { type: Boolean, default: true },
    schedule: { type: String, default: "0 3 * * *" },
    last_run: { type: Date },
  },
});

StorageConfigSchema.statics.build = (attrs?: StorageConfigAttrs) => {
  return new StorageConfigModel(attrs);
};

const StorageConfigModel = mongoose.model<
  StorageConfigDocument,
  IStorageConfigModel
>("storageConfig", StorageConfigSchema);

export default StorageConfigModel;
