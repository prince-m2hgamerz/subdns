"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Gauge } from "lucide-react";

interface Tier {
  name: string;
  rpm: number;
  burst: number;
  current: number;
  color: string;
}

const defaultTiers: Tier[] = [
  { name: "Free", rpm: 30, burst: 10, current: 4, color: "bg-neutral-400" },
  { name: "Pro", rpm: 300, burst: 50, current: 42, color: "bg-blue-500" },
  { name: "Business", rpm: 3000, burst: 200, current: 0, color: "bg-purple-500" },
  { name: "Enterprise", rpm: 30000, burst: 1000, current: 0, color: "bg-amber-500" },
];

export default function RateLimitsPage() {
  const [tiers, setTiers] = useState<Tier[]>(defaultTiers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rate Limits</h1>
        <p className="text-muted-foreground">API rate limit tiers and current usage for your account.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {tiers.map((tier) => (
            <Card key={tier.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{tier.name}</CardTitle>
                    <Badge variant="outline" className="text-xs font-mono">{tier.rpm.toLocaleString()} req/min</Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">Burst: {tier.burst}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Current usage</span>
                    <span>{tier.current} / {tier.rpm} RPM</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700">
                    <div
                      className={`h-2 rounded-full transition-all ${tier.color}`}
                      style={{ width: `${Math.min((tier.current / tier.rpm) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Include <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs dark:bg-neutral-800">Retry-After</code> header handling in your client.</p>
          <p>• Use exponential backoff when you receive a <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs dark:bg-neutral-800">429</code> response.</p>
          <p>• Batch multiple DNS operations into a single API call where possible.</p>
          <p>• Cache responses client-side with a reasonable TTL to reduce redundant requests.</p>
          <p className="text-xs italic mt-2">Exceed your plan limit? Upgrade to unlock a higher tier.</p>
        </CardContent>
      </Card>
    </div>
  );
}
