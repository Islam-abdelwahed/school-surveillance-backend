import mongoose, { Schema, Types } from "mongoose";

interface StorageStatusAttrs {
  config: Types.ObjectId;
  total_capacity_gb: Number;
  used_space_gb: Number;
  usage_Percentage: number;
  last_check: Date;
}

interface StorageDocument extends StorageStatusAttrs, mongoose.Document {
  _id: string;
  storage_config: {
    storage_path: string;
    auto_cleanup: {
      enabled: boolean;
      schedule: string;
      last_run: Date;
    };
  };
  createdAt: Date;
}

interface Model extends mongoose.Model<StorageDocument> {
  build(attrs: StorageStatusAttrs): StorageDocument;
}

const StorageStatusSchema = new Schema({
  config: { type: Types.ObjectId, ref: "storageConfig", required: true },
  total_capacity_gb: { type: Number, required: true },
  used_space_gb: { type: Number, required: true },
  usage_Percentage: { type: Number, required: true },
  last_check: Date,
});

const StorageStatusModel = mongoose.model<StorageDocument, Model>(
  "storageStatus",
  StorageStatusSchema
);

StorageStatusSchema.statics.build = (attrs: StorageStatusAttrs) => {
  return new StorageStatusModel(attrs);
};

export default StorageStatusModel;
