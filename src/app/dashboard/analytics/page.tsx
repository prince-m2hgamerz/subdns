"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Globe, Shield, Activity, TrendingUp } from "lucide-react";

interface DailyRow {
  date: string;
  queries: number;
  threats: number;
}

export default function AnalyticsPage() {
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [totalQueries, setTotalQueries] = useState(0);
  const [totalThreats, setTotalThreats] = useState(0);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/dns?days=${days}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setDaily(res.daily || []);
          setTotalQueries(res.totalQueries || 0);
          setTotalThreats(res.totalThreats || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [days]);

  const maxQueries = Math.max(...daily.map((d) => d.queries), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">DNS Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Query volume and threat statistics</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="h-9 rounded-xl border border-gray-250 bg-gray-100 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={1}>Last 24h</option>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Queries</p>
              <p className="text-2xl font-bold">{loading ? "—" : totalQueries.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Threats Blocked</p>
              <p className="text-2xl font-bold">{loading ? "—" : totalThreats.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Threat Rate</p>
              <p className="text-2xl font-bold">
                {loading ? "—" : totalQueries > 0 ? `${((totalThreats / totalQueries) * 100).toFixed(1)}%` : "0%"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-medium flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4" />
          Daily DNS Queries
        </h2>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
        ) : daily.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
        ) : (
          <div className="space-y-2">
            {daily.map((d) => (
              <div key={d.date} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-foreground">{d.queries} queries</span>
                    {d.threats > 0 && (
                      <Badge variant="destructive" className="text-[10px] h-4 px-1">
                        {d.threats} blocked
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(d.queries / maxQueries) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
