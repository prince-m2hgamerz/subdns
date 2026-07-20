"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Key, Webhook, ChevronRight, BookOpen, Terminal } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface ApiKeySummary {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
}

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_sent_at: string | null;
  last_status: number | null;
  created_at: string;
}

interface ActivityItem {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function DeveloperOverview() {
  const [apiKeys, setApiKeys] = useState<ApiKeySummary[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [loadingWebhooks, setLoadingWebhooks] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    fetchApiKeys().finally(() => setLoadingKeys(false));
    fetchWebhooks().finally(() => setLoadingWebhooks(false));
    fetchActivity().finally(() => setLoadingActivity(false));
  }, []);

  const fetchApiKeys = async () => {
    const res = await fetch("/api/api-keys");
    if (res.ok) {
      const data = await res.json();
      setApiKeys(Array.isArray(data) ? data : (data.keys ?? []));
    }
  };

  const fetchWebhooks = async () => {
    const res = await fetch("/api/webhooks");
    if (res.ok) {
      const data = await res.json();
      setWebhooks(data.webhooks ?? []);
    }
  };

  const fetchActivity = async () => {
    const res = await fetch("/api/activity?limit=5");
    if (res.ok) {
      const data = await res.json();
      setActivities(data.activities ?? []);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted-foreground">Integrate SubDNS into your tools and workflows</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Get up and running in minutes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">1</div>
            <div>
              <p className="text-sm font-medium">Create an API Key</p>
              <p className="text-xs text-muted-foreground">Generate a key from the API Keys section and scope it to the resources you need.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">2</div>
            <div>
              <p className="text-sm font-medium">Read the API Docs</p>
              <p className="text-xs text-muted-foreground">Explore the available endpoints, authentication, and error codes.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">3</div>
            <div>
              <p className="text-sm font-medium">Set Up Webhooks</p>
              <p className="text-xs text-muted-foreground">Subscribe to events so your services get notified in real time.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">4</div>
            <div>
              <p className="text-sm font-medium">Install the CLI</p>
              <p className="text-xs text-muted-foreground">Automate subdomain and DNS management from your terminal.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">API Keys</CardTitle>
              <CardDescription>{loadingKeys ? "..." : `${apiKeys.length} key${apiKeys.length !== 1 ? "s" : ""}`}</CardDescription>
            </div>
            <Key className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingKeys ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : apiKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No API keys yet. Create one to get started.</p>
            ) : (
              <ul className="space-y-2">
                {apiKeys.slice(0, 3).map((key) => (
                  <li key={key.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{key.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {key.last_used_at ? `Used ${formatRelativeTime(key.last_used_at)}` : "Never used"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/developer/api-keys"
              className="inline-flex items-center justify-center text-sm font-medium transition-colors h-8 px-3 rounded-md bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 mt-3"
            >
              Manage Keys <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Webhooks</CardTitle>
              <CardDescription>{loadingWebhooks ? "..." : `${webhooks.length} endpoint${webhooks.length !== 1 ? "s" : ""}`}</CardDescription>
            </div>
            <Webhook className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingWebhooks ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : webhooks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No webhooks configured. Subscribe to events to receive real-time notifications.</p>
            ) : (
              <ul className="space-y-2">
                {webhooks.slice(0, 3).map((wh) => (
                  <li key={wh.id} className="flex items-center justify-between text-sm">
                    <span className="max-w-[200px] truncate font-medium">{wh.url}</span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${wh.is_active ? "border-green-600 text-green-600" : ""}`}>
                      {wh.is_active ? "Active" : "Inactive"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/developer/webhooks"
              className="inline-flex items-center justify-center text-sm font-medium transition-colors h-8 px-3 rounded-md bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 mt-3"
            >
              Manage Webhooks <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {activities.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </div>
            <Link
              href="/developer/activity"
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activities.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{a.action}</span>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(a.createdAt)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
