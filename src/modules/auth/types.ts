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
    email: string;
    password: string;
    deviceId: string;
  }