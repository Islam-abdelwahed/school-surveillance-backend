import { Types } from "mongoose";
import DeviceModel, { IDeviceModel } from "./model";
import { DeviceDTO } from "./types";

export class DeviceService {
  constructor(private deviceModel: IDeviceModel) {}

  private readonly publicKeyRegex =
    /^-----BEGIN PUBLIC KEY-----[\s\S]+-----END PUBLIC KEY-----$/;

  private isValidPublicKey(key: string): boolean {
    return this.publicKeyRegex.test(key.trim());
  }

  async registerDevice(params: {
    userId: string;
    publicKey: string;
    deviceName: string;
  }): Promise<DeviceDTO> {
    try {
      const { userId, publicKey, deviceName } = params;
      //validate Public Key
      if (!this.isValidPublicKey(publicKey)) {
        throw new Error("Invalid public key format ");
      }

      const newDevice = this.deviceModel.build({
        user_id: new Types.ObjectId(userId),
        name: deviceName,
        is_revoked: false,
        public_key: publicKey,
        last_active: new Date(),
      });
      await newDevice.save();
      return {
        id: newDevice._id.toString(),
        is_revoked: newDevice.is_revoked,
        public_key: newDevice.public_key,
        last_active: newDevice.last_active,
      };
    } catch (error: any) {
      throw new Error(`Failed to register device: ${error.message}`);
    }
  }

  async listUserDevices(userId: string): Promise<DeviceDTO[]> {
    try {
      const devices = await this.deviceModel
        .find({
          user_id: new Types.ObjectId(userId),
          is_revoked: false,
        })
        .sort({ lastactive: -1 });

      return devices.map((device) => ({
        ...device.toObject(),
        id: device._id.toString(), // convert ObjectId to string
      }));
    } catch (error: any) {
      throw new Error(`Failed to register device: ${error.message}`);
    }
  }

  async getDevice(deviceId: string) {
    try {
      const device = await this.deviceModel.findById(deviceId);

      if (!device) throw new Error("No DEVICE FOUND");

      const { _id, name, is_revoked, public_key, last_active } = device;

      return { id: _id, name, is_revoked, public_key, last_active };
      
    } catch (error) {
      throw new Error("No DEVICE FOUND");
    }
  }
}
