import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:3001",
];

const STATE_CHANGING_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

const AUTH_API_PREFIX = "/api/auth/";

function isValidOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const source = origin || referer || "";
  if (!source) return false;
  if (/^https?:\/\/localhost(:\d+)?$/.test(source)) return true;
  return ALLOWED_ORIGINS.some((allowed) => source.startsWith(allowed));
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-DNS-Prefetch-Control": "on",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://sdk.cashfree.com https://pagead2.googlesyndication.com https://*.cloudflare.com https://challenges.cloudflare.com https://va.vercel-scripts.com https://vercel.live https://*.google",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.upstash.io https://api.cashfree.com https://sandbox.cashfree.com https://*.cloudflare.com https://vercel.live wss://*.vercel.live https://*.google.com https://*.doubleclick.net https://*.google https://*.g.doubleclick.net",
    "frame-src https://challenges.cloudflare.com https://vercel.live https://googleads.g.doubleclick.net https://*.google.com https://*.google",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

const redisUrl = process.env.REDIS_URL;
const redisToken = process.env.REDIS_TOKEN;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const stateChangingApi =
    path.startsWith("/api/") &&
    !path.startsWith(AUTH_API_PREFIX) &&
    STATE_CHANGING_METHODS.includes(req.method);

  if (stateChangingApi && !isValidOrigin(req)) {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  if (redisUrl && redisToken) {
    try {
      const redis = new Redis({ url: redisUrl, token: redisToken });
      const ip = getClientIp(req);
      const key = `ratelimit:${ip}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, 60);
      }
      if (count > 60) {
        return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": "60" },
        });
      }
    } catch {
      // rate limiting unavailable
    }
  }

  const response = NextResponse.next();

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
