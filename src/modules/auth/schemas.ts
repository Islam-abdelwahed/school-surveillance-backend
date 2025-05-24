import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  deviceName: z.string().min(3),
  publicKey: z.string().min(32),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  deviceId:z.string().length(24).optional(),
});
