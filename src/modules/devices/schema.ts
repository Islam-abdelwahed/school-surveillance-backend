import { z } from "zod";

export const registerDeviceSchema = z.object({
  userId: z.string(),
  publicKey: z
    .string()
    .regex(/^-----BEGIN PUBLIC KEY-----[\s\S]+-----END PUBLIC KEY-----$/),
  deviceName: z.string().min(2),
});
