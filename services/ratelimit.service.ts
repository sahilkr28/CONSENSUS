import { logger } from '../lib/logger';

// Try to load Upstash redis components dynamically or conditionally.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Local in-memory store for rate limiting (fallback)
interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();
const IP_LIMIT_PER_HOUR = 30; // Max 30 requests/hour per IP
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Global daily usage budget (to avoid blowing up API keys in public demos)
let globalDailyCounter = 0;
let globalCounterResetDate = new Date().toDateString();
const GLOBAL_DAILY_BUDGET = 200; // Max 200 full graph runs per day globally

function resetGlobalCounterIfNeeded() {
  const today = new Date().toDateString();
  if (today !== globalCounterResetDate) {
    globalDailyCounter = 0;
    globalCounterResetDate = today;
  }
}

/**
 * Checks rate limits and daily budget.
 * Returns { allowed: boolean, reason?: string, limit?: number, remaining?: number }
 */
export async function checkRateLimit(ipAddress: string): Promise<{
  allowed: boolean;
  reason?: string;
  limit: number;
  remaining: number;
}> {
  resetGlobalCounterIfNeeded();

  // 1. Check Global Daily Budget Cap
  if (globalDailyCounter >= GLOBAL_DAILY_BUDGET) {
    logger.warn(`[RATELIMIT] Global daily budget of ${GLOBAL_DAILY_BUDGET} reached.`);
    return {
      allowed: false,
      reason: 'Global daily rate limit reached. The demo is running at full capacity for today. Please try again tomorrow.',
      limit: GLOBAL_DAILY_BUDGET,
      remaining: 0,
    };
  }

  // 2. Perform Redis check if configured
  if (redisUrl && redisToken) {
    try {
      const { Redis } = await import('@upstash/redis');
      const { Ratelimit } = await import('@upstash/ratelimit');
      
      const redisInstance = new Redis({
        url: redisUrl,
        token: redisToken,
      });

      const ratelimit = new Ratelimit({
        redis: redisInstance,
        limiter: Ratelimit.slidingWindow(IP_LIMIT_PER_HOUR, '1 h'),
        analytics: true,
        prefix: '@consensus/ratelimit',
      });

      const { success, limit, remaining } = await ratelimit.limit(ipAddress);
      
      if (success) {
        globalDailyCounter++;
      } else {
        logger.warn(`[RATELIMIT] IP ${ipAddress} rate limited via Upstash Redis.`);
      }

      return {
        allowed: success,
        reason: success ? undefined : 'Too many research requests. Limit is 30 per hour.',
        limit,
        remaining,
      };
    } catch (err: any) {
      logger.error('[RATELIMIT] Redis Rate Limit failed, falling back to Memory Limit.', err);
    }
  }

  // 3. Fallback to Local In-Memory Sliding Window
  const now = Date.now();
  let record = memoryStore.get(ipAddress);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(ipAddress, record);
  }

  // Filter timestamps within window
  record.timestamps = record.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (record.timestamps.length >= IP_LIMIT_PER_HOUR) {
    logger.warn(`[RATELIMIT] IP ${ipAddress} rate limited via In-Memory Store.`);
    return {
      allowed: false,
      reason: 'Too many research requests. Limit is 30 per hour.',
      limit: IP_LIMIT_PER_HOUR,
      remaining: 0,
    };
  }

  record.timestamps.push(now);
  globalDailyCounter++;
  
  return {
    allowed: true,
    limit: IP_LIMIT_PER_HOUR,
    remaining: IP_LIMIT_PER_HOUR - record.timestamps.length,
  };
}
