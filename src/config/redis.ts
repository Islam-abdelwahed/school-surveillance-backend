import { RedisOptions } from "ioredis";
import { env } from "./env";

export interface RedisConfig extends RedisOptions {
  host: string;
  port: number;
  password?: string;
  username?: string;
  enableReadyCheck: boolean;
  maxRetriesPerRequest: number | null;
  connectTimeout: number;
  retryStrategy(times: number): number;
}

export const redisConfig: RedisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  connectTimeout: 10000,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    return Math.min(times * 100, 3000); // reconnect every few seconds
  },
};
