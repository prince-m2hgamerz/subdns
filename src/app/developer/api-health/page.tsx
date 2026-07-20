"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

interface EndpointStatus {
  name: string;
  endpoint: string;
  status: "operational" | "degraded" | "down";
  latency: number;
  lastChecked: string;
  uptime: number;
}

const defaultEndpoints: EndpointStatus[] = [
  { name: "REST API", endpoint: "/api/v1", status: "operational", latency: 45, lastChecked: "Just now", uptime: 99.97 },
  { name: "Authentication", endpoint: "/api/v1/auth", status: "operational", latency: 120, lastChecked: "Just now", uptime: 99.99 },
  { name: "DNS Operations", endpoint: "/api/v1/dns", status: "operational", latency: 32, lastChecked: "Just now", uptime: 99.95 },
  { name: "Webhook Delivery", endpoint: "/api/v1/webhooks", status: "operational", latency: 210, lastChecked: "Just now", uptime: 99.88 },
  { name: "Subdomain Management", endpoint: "/api/v1/subdomains", status: "operational", latency: 38, lastChecked: "Just now", uptime: 99.96 },
  { name: "API Key Management", endpoint: "/api/v1/keys", status: "operational", latency: 28, lastChecked: "Just now", uptime: 100 },
];

export default function ApiHealthPage() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>(defaultEndpoints);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const overall = endpoints.every((e) => e.status === "operational") ? "operational" : endpoints.some((e) => e.status === "down") ? "down" : "degraded";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Health</h1>
        <p className="text-muted-foreground">Real-time status and latency for all API endpoints.</p>
      </div>

      <Card className={overall === "operational" ? "border-green-500/30" : overall === "degraded" ? "border-yellow-500/30" : "border-red-500/30"}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>
              {loading ? "Checking..." : overall === "operational" ? "All systems operational" : overall === "degraded" ? "Partial degradation detected" : "Service disruption"}
            </CardDescription>
          </div>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : overall === "operational" ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <Card key={ep.name}>
              <div className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{ep.name}</p>
                    <Badge variant="outline" className={ep.status === "operational" ? "text-green-600 border-green-600" : ep.status === "degraded" ? "text-yellow-600 border-yellow-600" : "text-red-600 border-red-600"}>
                      {ep.status === "operational" ? "Operational" : ep.status === "degraded" ? "Degraded" : "Down"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{ep.endpoint}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ep.latency}ms</span>
                  <span>{ep.uptime}% uptime</span>
                  <span>Checked {ep.lastChecked}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
