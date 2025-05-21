export interface RegisterParams {
    username: string;
    email: string;
    password: string;
    device: {
      name: string;
      publicKey: string; 
    };
  }
export interface LoginParams {
    username: string;
    email: string;
    password: string;
    device: {
      name: string;
      publicKey: string;
    };
  }