import mongoose, { Schema, Model, Document, Types } from "mongoose";

// Interface for user attributes
export interface UserAttrs {
  username: string;
  email_hash: string;
  password: string;
  last_login?: Date;
}

// Interface for User document (adds Mongo document properties)
export interface UserDoc extends Document {
  _id:Types.ObjectId;
  username: string;
  email_hash: string;
  password: string;
  createdAt: Date;
}

// Interface for User model (static methods)
export interface IUserModel extends Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    email_hash: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: { createdAt: true } }
);

UserSchema.statics.build = (attrs: UserAttrs) => {
  return new UserModel(attrs);
};

const UserModel = mongoose.model<UserDoc, IUserModel>("Users", UserSchema);
export default UserModel;