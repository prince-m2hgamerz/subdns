"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Send, AlertCircle } from "lucide-react";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_sent_at: string | null;
  last_status: number | null;
  created_at: string;
}

const webhookEvents = [
  { value: "subdomain.created", label: "Subdomain Created" },
  { value: "dns.created", label: "DNS Record Created" },
  { value: "dns.updated", label: "DNS Record Updated" },
  { value: "subdomain.down", label: "Subdomain Down" },
  { value: "account.banned", label: "Account Suspended" },
  { value: "plan.changed", label: "Plan Changed" },
  { value: "report.status", label: "Report Status" },
  { value: "api_key.created", label: "API Key Created" },
];

export default function WebhookSettingsPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["subdomain.created", "dns.created"]);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/webhooks");
      if (res.ok) setWebhooks(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, events: selectedEvents, secret: secret || undefined }),
      });

      if (res.ok) {
        await fetchWebhooks();
        setShowForm(false);
        setUrl("");
        setSecret("");
        setSelectedEvents(["subdomain.created", "dns.created"]);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create webhook");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
    if (res.ok) setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    const res = await fetch(`/api/webhooks/${id}/test`, { method: "POST" });
    if (res.ok) {
      const result = await res.json();
      setWebhooks((prev) =>
        prev.map((w) => (w.id === id ? { ...w, last_status: result.status, last_sent_at: new Date().toISOString() } : w)),
      );
    }
    setTestingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-sm text-muted-foreground">Send real-time events to your endpoints</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          <Plus className="mr-2 h-4 w-4" /> Add Webhook
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Webhook</CardTitle>
            <CardDescription>Configure a new webhook endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Endpoint URL</label>
                <Input
                  placeholder="https://example.com/webhook"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Secret (optional)</label>
                <Input
                  placeholder="Used to sign webhook payloads"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Events</label>
                <div className="flex flex-wrap gap-2">
                  {webhookEvents.map((ev) => (
                    <button
                      key={ev.value}
                      type="button"
                      onClick={() => toggleEvent(ev.value)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        selectedEvents.includes(ev.value)
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {ev.label}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" variant="primary" disabled={saving || selectedEvents.length === 0}>
                  {saving ? "Creating..." : "Create Webhook"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No webhooks configured. Add one to receive event notifications.
          </CardContent>
        </Card>
      ) : (
        webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base break-all">{webhook.url}</CardTitle>
                <CardDescription>
                  {webhook.is_active ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                  {webhook.last_status !== null && (
                    <span className="ml-2 text-xs">
                      Last: {webhook.last_status === 0 ? "Failed" : `${webhook.last_status}`}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleTest(webhook.id)}
                  disabled={testingId === webhook.id}
                >
                  {testingId === webhook.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleDelete(webhook.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {webhook.events.map((ev) => (
                  <Badge key={ev} variant="outline" className="text-xs">
                    {ev}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
