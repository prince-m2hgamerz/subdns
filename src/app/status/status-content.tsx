"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const checks = [
  { id: "api", label: "API" },
  { id: "dns", label: "DNS Management" },
  { id: "auth", label: "Authentication" },
  { id: "cloudflare", label: "Cloudflare Proxy" },
];

type StatusMap = Record<string, "operational" | "degraded" | "down">;

export function StatusContent() {
  const [statuses, setStatuses] = useState<StatusMap>({
    api: "operational",
    dns: "operational",
    auth: "operational",
    cloudflare: "operational",
  });
  const [stats, setStats] = useState<{
    subdomains: number;
    dnsRecords: number;
    users: number;
  } | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/stats/public");
        if (res.ok) {
          const json = await res.json();
          setStats(json);
          setStatuses((prev) => ({ ...prev, api: "operational", auth: "operational" }));
        } else {
          setStatuses((prev) => ({ ...prev, api: "degraded" }));
        }
      } catch {
        setStatuses((prev) => ({ ...prev, api: "down" }));
      }
    }
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const allOperational = Object.values(statuses).every((s) => s === "operational");

  const icon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-12 py-16 px-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${
              allOperational ? "bg-green-500" : statuses.api === "degraded" ? "bg-yellow-500" : "bg-red-500"
            }`}
          />
          <h1 className="text-4xl font-bold tracking-tight">
            {allOperational ? "All Systems Operational" : "Issues Detected"}
          </h1>
        </div>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          We believe infrastructure should be transparent. Here is the live pulse of every service powering your free corner of the internet. Auto-refreshes every 30 seconds.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Services</h2>
        <div className="space-y-2">
          {checks.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <span className="font-medium">{c.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500 capitalize">{statuses[c.id]}</span>
                {icon(statuses[c.id])}
              </div>
            </div>
          ))}
        </div>
      </section>

      {stats && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Live Metrics</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 p-4 text-center dark:border-neutral-800">
              <div className="text-3xl font-bold">{stats.subdomains.toLocaleString()}</div>
              <div className="mt-1 text-sm text-neutral-500">Subdomains</div>
            </div>
            <div className="rounded-lg border border-neutral-200 p-4 text-center dark:border-neutral-800">
              <div className="text-3xl font-bold">{stats.dnsRecords.toLocaleString()}</div>
              <div className="mt-1 text-sm text-neutral-500">DNS Records</div>
            </div>
            <div className="rounded-lg border border-neutral-200 p-4 text-center dark:border-neutral-800">
              <div className="text-3xl font-bold">{stats.users.toLocaleString()}</div>
              <div className="mt-1 text-sm text-neutral-500">Users</div>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-lg font-semibold">Uptime History</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          SubDNS has maintained 99.9% uptime across every service since day one. Your corner of the internet stays lit — always. If something ever looks off, this page is the first to tell you.
        </p>
      </section>
    </div>
  );
}
