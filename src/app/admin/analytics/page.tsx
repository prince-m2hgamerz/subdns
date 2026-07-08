"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldAlert, TrendingUp } from "lucide-react";

interface DailyRow {
  date: string;
  queries: number;
  threats: number;
}

export default function AdminAnalyticsPage() {
  const { status } = useSession();
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [totalQueries, setTotalQueries] = useState(0);
  const [totalThreats, setTotalThreats] = useState(0);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (d: number) => {
    try {
      const res = await fetch(`/api/admin/analytics/dns?days=${d}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setDaily(json.daily ?? []);
      setTotalQueries(json.totalQueries ?? 0);
      setTotalThreats(json.totalThreats ?? 0);
      setLastUpdated(new Date());
    } catch {
      redirect("/auth/login");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/login");
    if (status !== "authenticated") return;
    fetchData(days);
    const interval = setInterval(() => fetchData(days), 30000);
    return () => clearInterval(interval);
  }, [status, days, fetchData]);

  const maxQueries = Math.max(...daily.map((d) => d.queries), 1);
  const blockRate = totalQueries > 0 ? ((totalThreats / totalQueries) * 100).toFixed(1) : "0.0";

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">DNS Analytics</h1>
          <p className="text-sm text-neutral-500">Platform-wide DNS query analytics</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-neutral-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-emerald-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
          <select
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm dark:border-neutral-800 dark:bg-neutral-950"
            value={days}
            onChange={(e) => { setLoading(true); setDays(parseInt(e.target.value)); }}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Queries</CardTitle>
            <Activity size={16} className="text-neutral-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalQueries.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Threats Blocked</CardTitle>
            <ShieldAlert size={16} className="text-red-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{totalThreats.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Block Rate</CardTitle>
            <TrendingUp size={16} className="text-neutral-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{blockRate}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Queries & Threats</CardTitle>
        </CardHeader>
        <CardContent>
          {daily.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">No analytics data available for this period.</p>
          ) : (
            <div className="space-y-4">
              {daily.map((d) => {
                const queryPct = (d.queries / maxQueries) * 100;
                const threatPct = d.queries > 0 ? (d.threats / d.queries) * 100 : 0;
                return (
                  <div key={d.date}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-neutral-500">
                        {d.queries} queries
                        {d.threats > 0 && (
                          <span className="ml-2 text-red-500">{d.threats} threats</span>
                        )}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${Math.max(queryPct, 2)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs text-neutral-400">{d.queries}</span>
                      </div>
                      {d.threats > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <div
                              className="h-full rounded-full bg-red-500 transition-all"
                              style={{ width: `${Math.max(threatPct, 1)}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs text-neutral-400">{d.threats}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
