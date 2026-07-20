"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface ServiceItem {
  id: string;
  label: string;
  status?: string;
  responseTimeMs?: number | null;
}

interface StatusData {
  summary: {
    totalServices: number;
    operational: number;
    degraded: number;
    unknown: number;
  };
  services: ServiceItem[];
  stats: {
    subdomains: number;
    dnsRecords: number;
    users: number;
  };
}

const statusIcon = (status: string | null | undefined) => {
  switch (status) {
    case "UP":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "DOWN":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-neutral-400" />;
  }
};

const statusLabel = (status: string | null | undefined) => {
  switch (status) {
    case "UP":
      return "Operational";
    case "DOWN":
      return "Down";
    default:
      return "Unknown";
  }
};

const statusClass = (status: string | null | undefined) => {
  switch (status) {
    case "UP":
      return "border-green-200 dark:border-green-900";
    case "DOWN":
      return "border-red-200 dark:border-red-900";
    default:
      return "border-neutral-200 dark:border-neutral-800";
  }
};

function ResponseTime({ ms }: { ms: number | null | undefined }) {
  if (ms == null) return null;
  const color = ms < 500 ? "text-green-500" : ms < 2000 ? "text-yellow-500" : "text-red-500";
  return <span className={color}>{ms}ms</span>;
}

function ServiceCard({ item }: { item: ServiceItem }) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${statusClass(item.status)}`}
    >
      <div className="flex flex-col">
        <span className="font-medium">{item.label}</span>
        <span className="text-xs text-neutral-500">
          {item.responseTimeMs != null && <ResponseTime ms={item.responseTimeMs} />}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-500">{statusLabel(item.status)}</span>
        {statusIcon(item.status)}
      </div>
    </div>
  );
}

export function StatusContent() {
  const [data, setData] = useState<StatusData | null>(null);
  const [error, setError] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/status-page");
      if (res.ok) {
        setData(await res.json());
        setLastFetch(new Date());
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (!data && !error) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  const allOperational = data && data.summary.degraded === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-12 py-16 px-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${
              error
                ? "bg-red-500"
                : allOperational
                  ? "bg-green-500"
                  : data!.summary.degraded > 0
                    ? "bg-red-500"
                    : "bg-yellow-500"
            }`}
          />
          <h1 className="text-4xl font-bold tracking-tight">
            {error
              ? "Unable to Fetch Status"
              : allOperational
                ? "All Systems Operational"
                : "Issues Detected"}
          </h1>
        </div>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Live status of every service powering SubDNS. Auto-refreshes every 30 seconds.
        </p>
        {lastFetch && (
          <p className="text-xs text-neutral-400">
            Last checked: {lastFetch.toLocaleTimeString()}
          </p>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What We Monitor</h2>
        <div className="space-y-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          <p>
            Every service listed below is checked from multiple geographic regions every 60 seconds.
            We monitor DNS resolution latency, API endpoint availability, website response times, and
            Cloudflare edge health. A service is marked <strong className="text-foreground">Operational</strong> when all probes
            return a successful response within acceptable latency thresholds. If any probe fails or
            exceeds its timeout, the service is marked <strong className="text-foreground">Degraded</strong> and we begin
            investigating immediately.
          </p>
          <p>
            When an incident is detected, our on-call team receives an automated alert within 30 seconds.
            We publish incident timelines, root cause analyses, and resolution summaries to this status
            page so you always have visibility into what happened and why. Planned maintenance is announced
            at least 24 hours in advance.
          </p>
          <p>
            This status page is itself hosted independently of the services it monitors. If you cannot
            reach this page, check our social media channels or contact support directly at{" "}
            <span className="text-foreground">subdns@m2hio.in</span>.
          </p>
        </div>
      </section>

      {data && (
        <>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Services</h2>
            <div className="space-y-2">
              {data.services.map((svc) => (
                <ServiceCard key={svc.id} item={svc} />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Live Metrics</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-neutral-200 p-4 text-center dark:border-neutral-800">
                <div className="text-3xl font-bold">{data.stats.subdomains.toLocaleString()}</div>
                <div className="mt-1 text-sm text-neutral-500">Subdomains</div>
              </div>
              <div className="rounded-lg border border-neutral-200 p-4 text-center dark:border-neutral-800">
                <div className="text-3xl font-bold">{data.stats.dnsRecords.toLocaleString()}</div>
                <div className="mt-1 text-sm text-neutral-500">DNS Records</div>
              </div>
              <div className="rounded-lg border border-neutral-200 p-4 text-center dark:border-neutral-800">
                <div className="text-3xl font-bold">{data.stats.users.toLocaleString()}</div>
                <div className="mt-1 text-sm text-neutral-500">Users</div>
              </div>
            </div>
          </section>
        </>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Could not reach the status API. The page will retry automatically.
          </p>
        </div>
      )}
    </div>
  );
}
