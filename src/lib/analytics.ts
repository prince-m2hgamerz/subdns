import { supabaseService } from "./supabase";

interface AnalyticsRow {
  date: string;
  queries: number;
  threats: number;
}

export async function getDnsAnalytics(userId: string, days = 7): Promise<{ daily: AnalyticsRow[]; totalQueries: number; totalThreats: number }> {
  const { data: subdomains } = await supabaseService
    .from("subdomains")
    .select("id, name")
    .eq("user_id", userId);
  if (!subdomains || subdomains.length === 0) {
    return { daily: [], totalQueries: 0, totalThreats: 0 };
  }
  const { data: activities } = await supabaseService
    .from("activities")
    .select("created_at, metadata")
    .in("subdomain_id", subdomains.map((s) => s.id))
    .gte("created_at", new Date(Date.now() - days * 86400000).toISOString())
    .order("created_at", { ascending: true });
  if (!activities || activities.length === 0) {
    return { daily: [], totalQueries: 0, totalThreats: 0 };
  }
  const dailyMap = new Map<string, { queries: number; threats: number }>();
  for (const a of activities) {
    const date = new Date(a.created_at).toISOString().slice(0, 10);
    const entry = dailyMap.get(date) || { queries: 0, threats: 0 };
    entry.queries++;
    if (a.metadata?.blocked) entry.threats++;
    dailyMap.set(date, entry);
  }
  const daily = Array.from(dailyMap.entries())
    .map(([date, counts]) => ({ date, queries: counts.queries, threats: counts.threats }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const totalQueries = daily.reduce((s, d) => s + d.queries, 0);
  const totalThreats = daily.reduce((s, d) => s + d.threats, 0);
  return { daily, totalQueries, totalThreats };
}

export async function getAllDnsAnalytics(days = 7): Promise<{ daily: AnalyticsRow[]; totalQueries: number; totalThreats: number }> {
  const { data: activities } = await supabaseService
    .from("activities")
    .select("created_at, metadata, subdomain_id")
    .gte("created_at", new Date(Date.now() - days * 86400000).toISOString())
    .order("created_at", { ascending: true });

  if (!activities || activities.length === 0) {
    return { daily: [], totalQueries: 0, totalThreats: 0 };
  }

  const dailyMap = new Map<string, { queries: number; threats: number }>();
  for (const a of activities) {
    const date = new Date(a.created_at).toISOString().slice(0, 10);
    const entry = dailyMap.get(date) || { queries: 0, threats: 0 };
    entry.queries++;
    if (a.metadata?.blocked) entry.threats++;
    dailyMap.set(date, entry);
  }

  const daily = Array.from(dailyMap.entries())
    .map(([date, counts]) => ({ date, queries: counts.queries, threats: counts.threats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalQueries = daily.reduce((s, d) => s + d.queries, 0);
  const totalThreats = daily.reduce((s, d) => s + d.threats, 0);

  return { daily, totalQueries, totalThreats };
}
