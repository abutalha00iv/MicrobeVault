import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | null | undefined;
}

type MemoryEntry = {
  value: string;
  expiresAt?: number;
};

const memoryStore = new Map<string, MemoryEntry>();

function createRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  return new Redis(process.env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1
  });
}

export const redis = global.redisClient ?? createRedisClient();
if (global.redisClient === undefined) {
  global.redisClient = redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (redis) {
    try {
      await redis.connect().catch(() => undefined);
      const value = await redis.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  const entry = memoryStore.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    memoryStore.delete(key);
    return null;
  }

  return JSON.parse(entry.value) as T;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 3600) {
  const serialized = JSON.stringify(value);

  if (redis) {
    try {
      await redis.connect().catch(() => undefined);
      await redis.set(key, serialized, "EX", ttlSeconds);
      return;
    } catch {
      // fall back to memory
    }
  }

  memoryStore.set(key, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
}

export async function cacheDelete(key: string) {
  if (redis) {
    try {
      await redis.connect().catch(() => undefined);
      await redis.del(key);
      return;
    } catch {
      // fall back to memory
    }
  }

  memoryStore.delete(key);
}

