import { supabaseService } from "./supabase";

interface MonitorRow {
  id: string;
  user_id: string;
  subdomain_id: string;
  label: string;
  url: string;
  check_interval: number;
  timeout: number;
  is_active: boolean;
  last_status: "UP" | "DOWN" | "UNKNOWN" | null;
  last_checked_at: string | null;
  uptime_percentage: number;
  created_at: string;
  updated_at: string;
}

interface CheckRow {
  id: string;
  monitor_id: string;
  status: "UP" | "DOWN";
  status_code: number | null;
  response_time_ms: number | null;
  error_message: string | null;
  checked_at: string;
}

export async function getAllMonitors(): Promise<(MonitorRow & { users?: { name: string | null; email: string | null } | null; subdomains?: { name: string } | null })[]> {
  const { data } = await supabaseService
    .from("uptime_monitors")
    .select("*, subdomains(name), users(name, email)")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getMonitors(userId: string): Promise<MonitorRow[]> {
  const { data } = await supabaseService
    .from("uptime_monitors")
    .select("*, subdomains!left(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function createMonitor(
  userId: string,
  subdomainId: string,
  label: string,
  url: string,
  checkInterval = 5,
  timeout = 30
): Promise<{ success: boolean; error?: string; data?: MonitorRow }> {
  const { data: subdomain } = await supabaseService
    .from("subdomains")
    .select("id")
    .eq("id", subdomainId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!subdomain) return { success: false, error: "Subdomain not found" };
  const { data, error } = await supabaseService
    .from("uptime_monitors")
    .insert({
      user_id: userId,
      subdomain_id: subdomainId,
      label,
      url,
      check_interval: checkInterval,
      timeout,
    })
    .select()
    .maybeSingle();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteMonitor(id: string, userId: string): Promise<boolean> {
  const { error } = await supabaseService
    .from("uptime_monitors")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}

export async function toggleMonitor(id: string, userId: string): Promise<boolean> {
  const { data: monitor } = await supabaseService
    .from("uptime_monitors")
    .select("is_active")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!monitor) return false;
  const { error } = await supabaseService
    .from("uptime_monitors")
    .update({ is_active: !monitor.is_active, updated_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}

export async function runCheck(monitorId: string): Promise<{ status: "UP" | "DOWN"; statusCode: number | null; responseTimeMs: number | null; errorMessage: string | null }> {
  const { data: monitor } = await supabaseService
    .from("uptime_monitors")
    .select("*")
    .eq("id", monitorId)
    .maybeSingle();
  if (!monitor) return { status: "DOWN", statusCode: null, responseTimeMs: null, errorMessage: "Monitor not found" };
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), (monitor.timeout || 30) * 1000);
    const res = await fetch(monitor.url, { signal: controller.signal, method: "HEAD" });
    clearTimeout(timer);
    const elapsed = Date.now() - start;
    const isUp = res.status < 500;
    await recordCheck(monitorId, isUp ? "UP" : "DOWN", res.status, elapsed, null);
    await updateMonitorStatus(monitorId, isUp ? "UP" : "DOWN");
    return { status: isUp ? "UP" : "DOWN", statusCode: res.status, responseTimeMs: elapsed, errorMessage: null };
  } catch (err) {
    const elapsed = Date.now() - start;
    await recordCheck(monitorId, "DOWN", null, elapsed, (err as Error).message);
    await updateMonitorStatus(monitorId, "DOWN");
    return { status: "DOWN", statusCode: null, responseTimeMs: elapsed, errorMessage: (err as Error).message };
  }
}

async function recordCheck(monitorId: string, status: "UP" | "DOWN", statusCode: number | null, responseTimeMs: number | null, errorMessage: string | null) {
  await supabaseService.from("uptime_checks").insert({
    monitor_id: monitorId,
    status,
    status_code: statusCode,
    response_time_ms: responseTimeMs,
    error_message: errorMessage,
  });
}

async function updateMonitorStatus(monitorId: string, status: "UP" | "DOWN") {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: checks } = await supabaseService
    .from("uptime_checks")
    .select("status")
    .eq("monitor_id", monitorId)
    .gte("checked_at", thirtyDaysAgo);
  const total = checks?.length || 0;
  const up = checks?.filter((c) => c.status === "UP").length || 0;
  const pct = total > 0 ? Math.round((up / total) * 10000) / 100 : 100;
  await supabaseService
    .from("uptime_monitors")
    .update({
      last_status: status,
      last_checked_at: new Date().toISOString(),
      uptime_percentage: pct,
      updated_at: new Date().toISOString(),
    })
    .eq("id", monitorId);
}

export async function getRecentChecks(monitorId: string, limit = 50): Promise<CheckRow[]> {
  const { data } = await supabaseService
    .from("uptime_checks")
    .select("*")
    .eq("monitor_id", monitorId)
    .order("checked_at", { ascending: false })
    .limit(limit);
  return data || [];
}
