import mongoose, { Schema } from "mongoose";

interface UserAttrs {
  username: string;
  email_hash: string;
  password: string;
  last_login?: Date;
}

interface UserDoc extends UserAttrs, mongoose.Document {
  _id: string;
  createdAt: Date;
}

interface usermodel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}
const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    email_hash: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    last_login: Date,
  },
  { timestamps: { createdAt: true } }
);

const UserModel = mongoose.model<UserDoc,usermodel>("Users", UserSchema);

UserSchema.statics.build = (attrs: UserAttrs) => {
  return new UserModel(attrs);
};

export { UserModel };
