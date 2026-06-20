// In-memory rate limiter for server functions.
// Note: In a serverless/edge environment with many instances, 
// this limits per-instance. For strict global limits, use Redis or Firestore.

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitRecord>();

/**
 * Enforce a rate limit for a given key (e.g., IP address or User ID + Endpoint)
 * @param key Unique identifier for the client and endpoint
 * @param maxRequests Maximum allowed requests in the window
 * @param windowMs Time window in milliseconds
 * @throws Error if rate limit is exceeded
 */
export function rateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  let record = store.get(key);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    store.set(key, record);
    return;
  }

  record.count++;
  if (record.count > maxRequests) {
    const minutesLeft = Math.ceil((record.resetTime - now) / 60000);
    throw new Error(`Too many requests. Please try again in ${minutesLeft} minute(s).`);
  }
}
