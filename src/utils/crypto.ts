import { hash, compare } from "bcrypt";
export class CryptoUtils {
  constructor() {}
  static async hashPassword(password: string): Promise<string> {
    return hash(password, 12);
  }

  static async comparePassword(password: string, hashPassword: string) {
    return await compare(password, hashPassword);
  }
}
