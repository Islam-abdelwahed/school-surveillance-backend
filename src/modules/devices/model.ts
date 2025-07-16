import mongoose, { Document, Model, Schema, Types } from "mongoose";

interface DeviceAttrs {
  user_id: Types.ObjectId;
  name: String;
  public_key: string;
  is_revoked: boolean;
  last_active: Date;
}

export interface DeviceDoc extends DeviceAttrs, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
} 

export interface IDeviceModel extends Model<DeviceDoc> {
  build(attrs: DeviceAttrs): DeviceDoc;
}
const DeviceSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "users", required: true },
    name: { type: String, required: true },
    is_revoked: { type: Boolean, required: true },
    last_active: { type: Date, required: true },
  },
  { timestamps: true }
);

DeviceSchema.statics.build = (attrs: DeviceAttrs) => {
  return new DeviceModel(attrs);
};

const DeviceModel = mongoose.model<DeviceDoc, IDeviceModel>(
  "Devices",
  DeviceSchema
);

export default DeviceModel;
