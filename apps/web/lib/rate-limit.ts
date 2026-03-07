import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "auth/challenge": { maxRequests: 10, windowMs: 60_000 },
  "auth/verify": { maxRequests: 5, windowMs: 60_000 },
  mint: { maxRequests: 10, windowMs: 3_600_000 },
  retire: { maxRequests: 10, windowMs: 3_600_000 },
  readings: { maxRequests: 60, windowMs: 60_000 },
  "meters/readings": { maxRequests: 10, windowMs: 60_000 },
  post_default: { maxRequests: 30, windowMs: 60_000 },
  get_default: { maxRequests: 120, windowMs: 60_000 },
}

function getWindowStart(windowMs: number): string {
  const now = Date.now()
  const windowStart = now - (now % windowMs)
  return new Date(windowStart).toISOString()
}

export async function checkRateLimit(
  identifier: string,
  route: string
): Promise<NextResponse | null> {
  const config = RATE_LIMITS[route] ?? RATE_LIMITS.post_default

  const key = `${route}:${identifier}`
  const windowStart = getWindowStart(config.windowMs)

  try {
    // Upsert: increment or create
    const { data } = await supabase
      .from("rate_limits")
      .upsert(
        { key, window_start: windowStart, count: 1 },
        { onConflict: "key,window_start" }
      )
      .select("count")
      .single()

    if (data && data.count > 1) {
      // Already existed, need to increment
      // The upsert reset it to 1, so we need a proper increment
    }

    // Use raw SQL for atomic increment
    const { data: result } = await supabase.rpc("increment_rate_limit", {
      p_key: key,
      p_window_start: windowStart,
    }).single()

    const count = (result as { count: number } | null)?.count ?? 1

    if (count > config.maxRequests) {
      const retryAfter = Math.ceil(config.windowMs / 1000)
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      )
    }
  } catch {
    // If rate limiting fails (e.g., table doesn't exist yet), allow the request
    console.error("[Rate Limit] Failed to check rate limit, allowing request")
  }

  return null
}

/** Extract client IP from request headers */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return req.headers.get("x-real-ip") ?? "unknown"
}
