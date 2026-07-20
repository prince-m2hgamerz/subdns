"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Loader2, Copy, Check } from "lucide-react";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const methods: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const methodColors: Record<HttpMethod, string> = {
  GET: "text-green-600 border-green-600",
  POST: "text-blue-600 border-blue-600",
  PUT: "text-orange-600 border-orange-600",
  DELETE: "text-red-600 border-red-600",
  PATCH: "text-purple-600 border-purple-600",
};

const exampleEndpoints = [
  { method: "GET" as HttpMethod, path: "/api/v1/subdomains", desc: "List all subdomains" },
  { method: "POST" as HttpMethod, path: "/api/v1/subdomains", desc: "Create a new subdomain" },
  { method: "GET" as HttpMethod, path: "/api/v1/dns", desc: "List DNS records" },
  { method: "GET" as HttpMethod, path: "/api/v1/webhooks", desc: "List webhooks" },
];

export default function PlaygroundPage() {
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [path, setPath] = useState("/api/v1/subdomains");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    setError("");
    setResponse(null);
    try {
      const res = await fetch(path, { method });
      const text = await res.text();
      let formatted = text;
      try { formatted = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      setResponse(`HTTP ${res.status} ${res.statusText}\n\n${formatted}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const fullUrl = `https://subdns.m2hio.in${path}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Playground</h1>
        <p className="text-muted-foreground">Test API endpoints live. Authenticated with your current session.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request</CardTitle>
          <CardDescription>Select a method and enter an endpoint path</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {methods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  method === m ? methodColors[m] + " bg-neutral-100 dark:bg-neutral-800" : "text-muted-foreground hover:border-neutral-400"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={path} onChange={(e) => setPath(e.target.value)} placeholder="/api/v1/..." className="font-mono text-sm" />
            <Button variant="primary" onClick={handleSend} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Send
            </Button>
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate">{fullUrl}</p>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleEndpoints.map((ex) => (
                <button
                  key={ex.path}
                  type="button"
                  onClick={() => { setMethod(ex.method); setPath(ex.path); }}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  <span className={methodColors[ex.method]}>{ex.method}</span> {ex.path}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500/30">
          <CardContent className="pt-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Response</CardTitle>
            <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard.writeText(response); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-100 dark:bg-black"><code>{response}</code></pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
