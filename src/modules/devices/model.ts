import mongoose, { Schema,Types } from "mongoose";

interface DeviceAttrs {
  user_id: Types.ObjectId;
  public_key: string;
  is_revoked: boolean;
  last_active: Date;
}

export interface DeviceDoc extends DeviceAttrs, mongoose.Document {
  _id: Types.ObjectId
}

interface Model extends mongoose.Model<DeviceDoc> {
  build(attrs: DeviceAttrs): DeviceDoc;
}
const DeviceSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "users", required: true },
  public_key: { type: String, required: true, unique: true },
  is_revoked: { type: Boolean, required: true },
  last_active: { type: Date, required: true },
});

const DeviceModel = mongoose.model<DeviceDoc,Model>("Devices", DeviceSchema);

DeviceSchema.statics.build = (attrs: DeviceAttrs) => {
  return new DeviceModel(attrs);
};

export default DeviceModel ;
