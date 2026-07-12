"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Smartphone } from "lucide-react";

const eventLabels: Record<string, string> = {
  notify_on_subdomain_created: "Subdomain Created",
  notify_on_dns_created: "DNS Record Created",
  notify_on_dns_updated: "DNS Record Updated",
  notify_on_subdomain_down: "Subdomain Down (Uptime Alert)",
  notify_on_account_banned: "Account Suspended",
  notify_on_plan_changed: "Plan Change",
  notify_on_report_status: "Report Status Update",
  notify_on_api_key_created: "API Key Created",
};

const eventDescriptions: Record<string, string> = {
  notify_on_subdomain_created: "When a new subdomain is created",
  notify_on_dns_created: "When a DNS record is added",
  notify_on_dns_updated: "When a DNS record is modified",
  notify_on_subdomain_down: "When a subdomain fails an uptime check",
  notify_on_account_banned: "When your account is suspended",
  notify_on_plan_changed: "When your subscription plan changes",
  notify_on_report_status: "When the status of a report you submitted changes",
  notify_on_api_key_created: "When a new API key is generated",
};

export default function NotificationSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/user/notification-preferences")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setPrefs(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold">Notification Preferences</h1>
        <p className="text-sm text-muted-foreground">Choose which events trigger email notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>You&apos;ll receive emails for the events you enable below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(eventLabels).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor={key} className="cursor-pointer font-medium">{label}</Label>
                <p className="text-sm text-muted-foreground">{eventDescriptions[key]}</p>
              </div>
              <Switch
                id={key}
                checked={prefs[key] ?? true}
                onCheckedChange={() => handleToggle(key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" /> SMS Notifications</CardTitle>
          <CardDescription>
            {session?.user?.phone
              ? `SMS will be sent to ${session.user.phone} for each event type you enable above.`
              : "Set your phone number in Settings to receive SMS notifications."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!session?.user?.phone && (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="mb-2 text-sm text-muted-foreground">No phone number on file</p>
              <Button variant="outline" onClick={() => router.push("/dashboard/settings")}>
                Add Phone Number
              </Button>
            </div>
          )}
          {session?.user?.phone && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="notify_by_sms" className="cursor-pointer font-medium">Receive SMS notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send SMS alerts for all enabled events ({session.user.phone})
                </p>
              </div>
              <Switch
                id="notify_by_sms"
                checked={prefs["notify_by_sms"] ?? false}
                onCheckedChange={() => handleToggle("notify_by_sms")}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} variant="primary" disabled={saving} className="w-full sm:w-auto">
        {saving ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
        ) : saved ? (
          <><Save className="mr-2 h-4 w-4" /> Saved!</>
        ) : (
          <><Save className="mr-2 h-4 w-4" /> Save Preferences</>
        )}
      </Button>
    </div>
  );
}
