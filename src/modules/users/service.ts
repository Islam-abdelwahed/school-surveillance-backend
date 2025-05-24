import { IUserModel } from "./model";
import { UserDTO } from "./types";

export class UserService {
  constructor(private userModel: IUserModel) {}

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email_hash: email });
    return user;
  }

  async createUser(userAttrs: {
    username: string;
    email: string;
    passwordHash: string;
  }): Promise<UserDTO> {
    const user = this.userModel.build({
      username: userAttrs.username,
      email_hash: userAttrs.email,
      password: userAttrs.passwordHash,
    });
    user.save();
    return {
      id: user._id.toString(),
      username: user.username,
      email_hash: user.email_hash,
      password: user.password,
    };
  }

  async findUserById(userId: string) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) throw new Error("USER NOT FOUND");
      const { _id, username, email_hash, password } = user;
      return { id: _id, username, email_hash, password };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateUserData(
    userId: string,
    params: { email: string; username: string }
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error("USER NOT FOUND");
    user.email_hash = params.email;
    user.username = params.username;
    await user.save();
    const { _id, username, email_hash, password } = user;
    return { id: _id, username, email_hash, password };
  }
  async deleteUser(userId: string) {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) throw new Error("USER NOT FOUND");
  }
}
