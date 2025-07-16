import mongoose, { Schema, Model, Document, Types } from "mongoose";

// Interface for user attributes
export interface UserAttrs {
  username: string;
  email_hash: string;
  role?: string;
  phone?: string;
  schoolName?: string;
  password: string;
  last_login?: Date;
}

// Interface for User document (adds Mongo document properties)
export interface UserDoc extends Document,UserAttrs {
  _id:Types.ObjectId;
  createdAt: Date;
}

// Interface for User model (static methods)
export interface IUserModel extends Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    role: {type: String, enum: ['Head','Teacher'], default: "Head"},
    phone: {type: String ,default:" "},
    schoolNName: {type: String, default: " "},
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