import { Redis } from "@upstash/redis";

const redis = process.env.REDIS_URL
  ? new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN || "",
    })
  : null;

const globalForCache = globalThis as unknown as {
  __inMemoryCache?: Map<string, { data: string; expiry: number }>;
};
if (!globalForCache.__inMemoryCache) {
  globalForCache.__inMemoryCache = new Map();
}
const cache = globalForCache.__inMemoryCache;

const MEMORY_TTL = 60_000;

export async function getCached<T>(key: string): Promise<T | null> {
  if (redis) {
    try {
      return await redis.get<T>(key);
    } catch {
      return null;
    }
  }
  console.log(`[cache GET] key=${key} cache.size=${cache.size} hasKey=${cache.has(key)}`);
  const item = cache.get(key);
  if (item && Date.now() < item.expiry) {
    const parsed = JSON.parse(item.data) as T;
    console.log(`[cache GET] FOUND key=${key} expiry=${item.expiry} now=${Date.now()} valid=true`);
    return parsed;
  }
  if (item) {
    console.log(`[cache GET] EXPIRED key=${key} expiry=${item.expiry} now=${Date.now()}`);
  }
  cache.delete(key);
  return null;
}

export async function setCache<T>(
  key: string,
  data: T,
  ttlSeconds = 300
): Promise<void> {
  if (redis) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
      return;
    } catch {

    }
  }
  console.log(`[cache SET] key=${key} cache.size=${cache.size}`);
  cache.set(key, {
    data: JSON.stringify(data),
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

export async function invalidateCache(key: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(key);
      return;
    } catch {

    }
  }
  cache.delete(key);
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  if (redis) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return;
    } catch {

    }
  }
  for (const key of cache.keys()) {
    if (key.startsWith(pattern)) cache.delete(key);
  }
}
