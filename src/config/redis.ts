import { RedisOptions } from "ioredis";
import { env } from "./env";

export interface RedisConfig extends RedisOptions {
  host: string;
  port: number;
  password?: string;
  enableReadyCheck: boolean;
  maxRetriesPerRequest: number | null;
}

export const redisConfig: RedisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};
