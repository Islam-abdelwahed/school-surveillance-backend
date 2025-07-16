import mongoose, { Schema, Types, Model, Document } from "mongoose";

interface StorageStatusAttrs {
  config: Types.ObjectId;
  total_capacity_gb: Number;
  used_space_gb: Number;
  usage_Percentage: number;
  last_check?: Date;
}

export interface StorageStatusDocument extends StorageStatusAttrs, Document {
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

export interface IStorageStatusModel extends Model<StorageStatusDocument> {
  build(attrs: StorageStatusAttrs): StorageStatusDocument;
}

const StorageStatusSchema = new Schema({
  config: { type: Types.ObjectId, ref: "storageConfig", required: true },
  total_capacity_gb: { type: Number, required: true },
  used_space_gb: { type: Number, required: true },
  usage_Percentage: { type: Number, required: true },
  last_check: Date,
});

StorageStatusSchema.statics.build = (attrs: StorageStatusAttrs) => {
  return new StorageStatusModel(attrs);
};

const StorageStatusModel = mongoose.model<
  StorageStatusDocument,
  IStorageStatusModel
>("storageStatus", StorageStatusSchema);


export default StorageStatusModel;
