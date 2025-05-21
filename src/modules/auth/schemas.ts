import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  deviceName: z.string().min(2),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    deviceId: z.string().uuid().optional()
  });