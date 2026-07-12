"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isValidSubdomain, isReservedName } from "@/lib/utils";

export default function NewSubdomainPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [type, setType] = useState("CNAME");
  const [proxied, setProxied] = useState(false);
  const [domain, setDomain] = useState("");
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/domains")
      .then((r) => r.json())
      .then((data) => {
        if (data.domains?.length) {
          setAvailableDomains(data.domains);
          setDomain(data.defaultDomain ?? data.domains[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !target) {
      setError("Subdomain name and target are required");
      return;
    }

    if (!domain) {
      setError("No root domains available");
      return;
    }

    if (!isValidSubdomain(name)) {
      setError("Invalid subdomain name. Use only lowercase letters, numbers, and hyphens (cannot start or end with a hyphen).");
      return;
    }

    if (isReservedName(name)) {
      setError("This subdomain name is reserved.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/subdomains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, target, type, proxied, domain }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to create subdomain (${res.status})`);
        return;
      }

      const data = await res.json();

      router.push(`/dashboard/subdomains/${data.subdomain.id}`);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/subdomains">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Subdomain</h1>
          <p className="text-sm text-muted-foreground">Claim a free subdomain</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Root Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                required
              >
                {availableDomains.length === 0 && (
                  <option value="">Loading...</option>
                )}
                {availableDomains.map((d) => (
                  <option key={d} value={d}>
                    .{d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subdomain</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="my-project"
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  required
                  maxLength={63}
                  pattern="[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?"
                  title="Lowercase letters, numbers, and hyphens only. Cannot start or end with a hyphen (max 63 chars)."
                  className="font-mono"
                />
                <span className="shrink-0 text-sm text-muted-foreground">.{domain || "..."}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target</label>
              <Input
                placeholder="your-app.onrender.com"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                IP address (A) or hostname (CNAME) your subdomain points to
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Record Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="A">A - IPv4 address</option>
                <option value="AAAA">AAAA - IPv6 address</option>
                <option value="CNAME">CNAME - Canonical name</option>
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={proxied}
                onChange={(e) => setProxied(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm">Proxy through Cloudflare (orange cloud)</span>
            </label>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Subdomain"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
