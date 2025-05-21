import { UserModel } from "./model";
import { UserDTO } from "./types";

export class UserService {
  constructor(private userModel: typeof UserModel) {}

  async findByEmail(email: string): Promise<UserDTO> {
    const user = await this.userModel.findOne({ email_hash: email });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user._id,
      username: user.username,
      email_hash: user.email_hash,
      password: user.password,
      last_login: user.last_login,
    };
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
      id: user._id,
      username: user.username,
      email_hash: user.email_hash,
      password: user.password,
      last_login: user.last_login,
    };
  }
}
