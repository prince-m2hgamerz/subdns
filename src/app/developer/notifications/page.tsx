"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Loader2, Check } from "lucide-react";

interface NotificationChannel {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

interface NotificationEvent {
  id: string;
  event: string;
  label: string;
  email: boolean;
  webhook: boolean;
  inApp: boolean;
}

const channels: NotificationChannel[] = [
  { id: "email", name: "Email", icon: "✉", enabled: true },
  { id: "webhook", name: "Webhook", icon: "⚡", enabled: true },
  { id: "inapp", name: "In-App", icon: "🔔", enabled: false },
];

const defaultEvents: NotificationEvent[] = [
  { id: "subdomain_created", event: "subdomain.created", label: "Subdomain Created", email: false, webhook: true, inApp: true },
  { id: "subdomain_down", event: "subdomain.down", label: "Subdomain Down", email: true, webhook: true, inApp: true },
  { id: "dns_updated", event: "dns.updated", label: "DNS Record Updated", email: false, webhook: true, inApp: true },
  { id: "api_key_created", event: "api_key.created", label: "API Key Created", email: true, webhook: false, inApp: true },
  { id: "report_status", event: "report.status", label: "Report Status", email: false, webhook: true, inApp: true },
  { id: "plan_changed", event: "plan.changed", label: "Plan Changed", email: true, webhook: false, inApp: true },
  { id: "account_banned", event: "account.banned", label: "Account Suspended", email: true, webhook: true, inApp: true },
];

export default function NotificationsPage() {
  const [events, setEvents] = useState<NotificationEvent[]>(defaultEvents);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (id: string, field: "email" | "webhook" | "inApp") => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: !e[field] } : e)));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Configure which events trigger alerts and how they are delivered.</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {saving ? "Saving..." : saved ? "Saved" : "Save Preferences"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Channels</CardTitle>
          <CardDescription>Channels currently active on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {channels.map((ch) => (
              <div key={ch.id} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${ch.enabled ? "border-green-500/30 text-green-600" : "text-muted-foreground"}`}>
                <span>{ch.icon}</span>
                <span>{ch.name}</span>
                {ch.enabled ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Subscriptions</CardTitle>
          <CardDescription>Toggle notifications per event and channel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {events.map((ev) => (
              <div key={ev.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{ev.label}</span>
                  <Badge variant="outline" className="text-xs font-mono">{ev.event}</Badge>
                </div>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" checked={ev.email} onChange={() => toggle(ev.id, "email")} className="rounded border-neutral-400" />
                    Email
                  </label>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" checked={ev.webhook} onChange={() => toggle(ev.id, "webhook")} className="rounded border-neutral-400" />
                    Webhook
                  </label>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" checked={ev.inApp} onChange={() => toggle(ev.id, "inApp")} className="rounded border-neutral-400" />
                    In-App
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
