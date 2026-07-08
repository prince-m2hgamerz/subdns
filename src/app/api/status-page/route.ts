import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CF_API = "https://api.cloudflare.com/client/v4";
const TIMEOUT_MS = 8000;

interface PlatformService {
  id: string;
  label: string;
  type: "fetch" | "supabase" | "cloudflare" | "auth";
  target?: string;
}

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

const platformServices: PlatformService[] = [
  { id: "api", label: "API", type: "fetch", target: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" },
  { id: "database", label: "Database", type: "supabase", target: "ping" },
  { id: "edge-functions", label: "Edge Functions", type: "cloudflare", target: ZONE_ID ? `zones/${ZONE_ID}/workers/routes` : "zones" },
  { id: "dns", label: "DNS Management", type: "cloudflare", target: ZONE_ID ? `zones/${ZONE_ID}/dns_records?per_page=1` : "zones" },
  { id: "auth", label: "Authentication", type: "auth", target: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/session` },
  { id: "cloudflare-proxy", label: "Cloudflare Proxy", type: "cloudflare", target: "zones" },
];

async function checkWithTimeout(url: string, timeoutMs = TIMEOUT_MS): Promise<{ ok: boolean; status: number; ms: number }> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, method: "HEAD" });
    return { ok: res.ok, status: res.status, ms: Date.now() - start };
  } catch {
    return { ok: false, status: 0, ms: Date.now() - start };
  } finally {
    clearTimeout(timer);
  }
}

async function checkCloudflare(endpoint: string): Promise<{ ok: boolean; status: number; ms: number }> {
  const email = process.env.CLOUDFLARE_API_EMAIL;
  const key = process.env.CLOUDFLARE_API_KEY;
  if (!email || !key) return { ok: false, status: 0, ms: 0 };

  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${CF_API}/${endpoint}`, {
      signal: controller.signal,
      headers: { "X-Auth-Email": email, "X-Auth-Key": key },
    });
    return { ok: res.ok, status: res.status, ms: Date.now() - start };
  } catch {
    return { ok: false, status: 0, ms: Date.now() - start };
  } finally {
    clearTimeout(timer);
  }
}

async function checkSupabase(): Promise<{ ok: boolean; status: number; ms: number }> {
  const start = Date.now();
  try {
    const { error } = await supabaseService.from("users").select("*", { count: "exact", head: true });
    return { ok: !error, status: error ? 500 : 200, ms: Date.now() - start };
  } catch {
    return { ok: false, status: 0, ms: Date.now() - start };
  }
}

async function checkAuth(url: string): Promise<{ ok: boolean; status: number; ms: number }> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, method: "GET" });
    if (!res.ok) return { ok: false, status: res.status, ms: Date.now() - start };
    await res.json();
    return { ok: true, status: 200, ms: Date.now() - start };
  } catch {
    return { ok: false, status: 0, ms: Date.now() - start };
  } finally {
    clearTimeout(timer);
  }
}

async function checkPlatformService(svc: PlatformService): Promise<{
  id: string;
  label: string;
  status: string;
  responseTimeMs: number | null;
}> {
  let result: { ok: boolean; status: number; ms: number };

  switch (svc.type) {
    case "fetch":
      result = await checkWithTimeout(svc.target!);
      break;
    case "cloudflare":
      result = await checkCloudflare(svc.target!);
      break;
    case "supabase":
      result = await checkSupabase();
      break;
    case "auth":
      result = await checkAuth(svc.target!);
      break;
    default:
      result = { ok: false, status: 0, ms: 0 };
  }

  return {
    id: svc.id,
    label: svc.label,
    status: result.ok ? "UP" : "DOWN",
    responseTimeMs: result.ms,
  };
}

export async function GET() {
  const [platformResults, statsResults] = await Promise.all([
    Promise.all(platformServices.map((svc) => checkPlatformService(svc))),
    Promise.all([
      supabaseService.from("users").select("*", { count: "exact", head: true }),
      supabaseService.from("subdomains").select("*", { count: "exact", head: true }),
      supabaseService.from("dns_records").select("*", { count: "exact", head: true }),
    ]),
  ]);

  const totalUsers = statsResults[0].count ?? 0;
  const totalSubdomains = statsResults[1].count ?? 0;
  const totalRecords = statsResults[2].count ?? 0;

  const operational = platformResults.filter((s) => s.status === "UP").length;
  const degraded = platformResults.filter((s) => s.status === "DOWN").length;

  return NextResponse.json({
    summary: {
      totalServices: platformResults.length,
      operational,
      degraded,
      unknown: platformResults.length - operational - degraded,
    },
    services: platformResults,
    stats: {
      subdomains: totalSubdomains,
      dnsRecords: totalRecords,
      users: totalUsers,
    },
  });
}
