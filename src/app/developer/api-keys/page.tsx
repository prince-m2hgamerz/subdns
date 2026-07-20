"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Key, ExternalLink } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface ApiKeySummary {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
}

export default function DeveloperApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiKeys().finally(() => setLoading(false));
  }, []);

  const fetchApiKeys = async () => {
    const res = await fetch("/api/api-keys");
    if (res.ok) {
      const data = await res.json();
      setApiKeys(Array.isArray(data) ? data : (data.keys ?? []));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-sm text-muted-foreground">Summary of your API keys</p>
        </div>
        <Link href="/dashboard/api-keys">
          <Button variant="primary" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" /> Full Management
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Keys</CardTitle>
          <CardDescription>Full management is available on the dedicated page.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="py-8 text-center">
              <Key className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No API keys yet.</p>
              <Link href="/dashboard/api-keys">
                <Button variant="primary" size="sm" className="mt-3">Create Your First Key</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {key.last_used_at ? `Last used ${formatRelativeTime(key.last_used_at)}` : "Never used"}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold">Active</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
