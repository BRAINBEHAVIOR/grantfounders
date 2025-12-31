type RateLimitConfig = {
  windowMs: number
  max: number
}

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export function checkRateLimit(key: string, config: RateLimitConfig) {
  const now = Date.now()
  const bucket = buckets.get(key) || { count: 0, resetAt: now + config.windowMs }

  if (bucket.resetAt < now) {
    bucket.count = 0
    bucket.resetAt = now + config.windowMs
  }

  bucket.count += 1
  buckets.set(key, bucket)

  const remaining = Math.max(config.max - bucket.count, 0)
  const retryAfterMs = bucket.resetAt - now

  return {
    ok: bucket.count <= config.max,
    remaining,
    retryAfterMs,
  }
}
