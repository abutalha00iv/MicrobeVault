import { Redis } from "@upstash/redis";

type MemoryEntry = {
  value: string;
  expiresAt?: number;
};

const memoryStore = new Map<string, MemoryEntry>();

function createRedisClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export const redis = createRedisClient();

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (redis) {
    try {
      const value = await redis.get<T>(key);
      return value ?? null;
    } catch {
      return null;
    }
  }

  const entry = memoryStore.get(key);
  if (!entry) return null;

  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    memoryStore.delete(key);
    return null;
  }

  return JSON.parse(entry.value) as T;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 3600) {
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
      return;
    } catch {
      // fall back to memory
    }
  }

  memoryStore.set(key, {
    value: JSON.stringify(value),
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function cacheDelete(key: string) {
  if (redis) {
    try {
      await redis.del(key);
      return;
    } catch {
      // fall back to memory
    }
  }

  memoryStore.delete(key);
}
