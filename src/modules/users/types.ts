export interface UserDTO {
  id: string;
  username: string;
  email_hash: string;
  password: string;
  last_login?: Date;
}
