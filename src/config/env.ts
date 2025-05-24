import { z } from "zod";
 
const schema = z.object({
  DATABASE_URI: z.string().min(1).includes("mongodb+srv://"),
  DATABASE_NAME: z.string().min(3),

  REDIS_HOST: z.string().min(9).default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),

  JWT_SECRET: z.string().min(32),

  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "prodution"]).default("development"),
});

const envValidation = schema.safeParse(process.env);

if (!envValidation.success) {
  const errors = envValidation.error.issues.map((i) => {
    `${i.path} : ${i.message}`;
  });
  throw new Error(`Environment validation failed:\n ${errors.join("\n")}`);
}

export const env = envValidation.data;
