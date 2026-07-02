import { CACHE_TTLS } from '../lib/constants';
import { logger } from '../lib/logger';
import { FinalReport } from '../types';

interface CacheEntry<T> {
  value: T;
  expiry: number;
  timestamp: string; // ISO date string of creation
}

// In-Memory Fallback Caches
const financialsMemory = new Map<string, CacheEntry<any>>();
const newsMemory = new Map<string, CacheEntry<any>>();
const reportsMemory = new Map<string, CacheEntry<FinalReport>>();

// Active workflows registry for polling
export const activeWorkflows = new Map<string, any>();

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

async function getRedisClient() {
  if (redisUrl && redisToken) {
    try {
      const { Redis } = await import('@upstash/redis');
      return new Redis({ url: redisUrl, token: redisToken });
    } catch (e) {
      logger.error('[CACHE] Failed to load Redis client', e);
    }
  }
  return null;
}

export async function getCachedFinancials(ticker: string): Promise<any | null> {
  const key = ticker.toUpperCase();
  
  // Redis check
  const redis = await getRedisClient();
  if (redis) {
    try {
      const entry = await redis.get<CacheEntry<any>>(`consensus:financials:${key}`);
      if (entry && entry.expiry > Date.now()) {
        return entry.value;
      }
    } catch (err) {
      logger.error('[CACHE] Redis financials retrieval error', err);
    }
  }

  // Memory fallback
  const entry = financialsMemory.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.value;
  }
  return null;
}

export async function setCachedFinancials(ticker: string, data: any): Promise<void> {
  const key = ticker.toUpperCase();
  const entry: CacheEntry<any> = {
    value: data,
    expiry: Date.now() + CACHE_TTLS.FINANCIALS,
    timestamp: new Date().toISOString(),
  };

  financialsMemory.set(key, entry);

  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.set(`consensus:financials:${key}`, entry, { ex: CACHE_TTLS.FINANCIALS / 1000 });
    } catch (err) {
      logger.error('[CACHE] Redis financials write error', err);
    }
  }
}

export async function getCachedNews(ticker: string): Promise<any | null> {
  const key = ticker.toUpperCase();
  
  const redis = await getRedisClient();
  if (redis) {
    try {
      const entry = await redis.get<CacheEntry<any>>(`consensus:news:${key}`);
      if (entry && entry.expiry > Date.now()) {
        return entry.value;
      }
    } catch (err) {
      logger.error('[CACHE] Redis news retrieval error', err);
    }
  }

  const entry = newsMemory.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.value;
  }
  return null;
}

export async function setCachedNews(ticker: string, data: any): Promise<void> {
  const key = ticker.toUpperCase();
  const entry: CacheEntry<any> = {
    value: data,
    expiry: Date.now() + CACHE_TTLS.NEWS,
    timestamp: new Date().toISOString(),
  };

  newsMemory.set(key, entry);

  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.set(`consensus:news:${key}`, entry, { ex: CACHE_TTLS.NEWS / 1000 });
    } catch (err) {
      logger.error('[CACHE] Redis news write error', err);
    }
  }
}

export async function getCachedReport(ticker: string): Promise<{ report: FinalReport; ageMinutes: number } | null> {
  const key = ticker.toUpperCase();
  
  const redis = await getRedisClient();
  if (redis) {
    try {
      const entry = await redis.get<CacheEntry<FinalReport>>(`consensus:report:${key}`);
      if (entry && entry.expiry > Date.now()) {
        const ageMinutes = Math.round((Date.now() - new Date(entry.timestamp).getTime()) / 60000);
        return { report: entry.value, ageMinutes };
      }
    } catch (err) {
      logger.error('[CACHE] Redis report retrieval error', err);
    }
  }

  const entry = reportsMemory.get(key);
  if (entry && entry.expiry > Date.now()) {
    const ageMinutes = Math.round((Date.now() - new Date(entry.timestamp).getTime()) / 60000);
    return { report: entry.value, ageMinutes };
  }
  return null;
}

export async function setCachedReport(ticker: string, report: FinalReport): Promise<void> {
  const key = ticker.toUpperCase();
  const entry: CacheEntry<FinalReport> = {
    value: report,
    expiry: Date.now() + CACHE_TTLS.REPORTS,
    timestamp: new Date().toISOString(),
  };

  reportsMemory.set(key, entry);

  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.set(`consensus:report:${key}`, entry, { ex: CACHE_TTLS.REPORTS / 1000 });
    } catch (err) {
      logger.error('[CACHE] Redis report write error', err);
    }
  }
}

export async function invalidateReportCache(ticker: string): Promise<void> {
  const key = ticker.toUpperCase();
  reportsMemory.delete(key);
  
  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.del(`consensus:report:${key}`);
    } catch (err) {
      logger.error('[CACHE] Redis report delete error', err);
    }
  }
}
