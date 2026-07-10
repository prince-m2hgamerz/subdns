"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS, type PlanId } from "@/lib/plans";
import { Bell, Webhook, Check, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<PlanId | null>(null);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/plan")
      .then((r) => r.json())
      .then((d) => { if (d.plan) setCurrentPlanId(d.plan); })
      .finally(() => setPlanLoading(false));
  }, []);

  const currentPlan = currentPlanId ? PLANS[currentPlanId] : null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="flex gap-1 rounded-lg border border-border p-1 text-sm">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 rounded-md px-3 py-1.5 font-medium"
        >
          Profile
        </Link>
        <Link
          href="/dashboard/settings/notifications"
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          Notifications
        </Link>
        <Link
          href="/dashboard/settings/webhooks"
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Webhook className="h-4 w-4" />
          Webhooks
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={session?.user?.email || ""}
                disabled
                className="cursor-not-allowed opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : saved ? "Saved!" : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {planLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading plan...
            </div>
          ) : currentPlan ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{currentPlan.name}</p>
                  <p className="text-sm text-muted-foreground">{currentPlan.priceDisplay}/month</p>
                </div>
                <Badge variant="outline">{currentPlan.description}</Badge>
              </div>
              <ul className="space-y-1.5">
                {currentPlan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
                <div>
                  <span className="text-xs text-muted-foreground">Subdomains</span>
                  <p className="font-medium">{currentPlan.maxSubdomains}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">DNS Records</span>
                  <p className="font-medium">{currentPlan.maxDnsRecords}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">API Keys</span>
                  <p className="font-medium">{currentPlan.maxApiKeys}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Log Retention</span>
                  <p className="font-medium">{currentPlan.activityRetentionDays} days</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/dashboard/upgrade"
                  className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  Upgrade Plan
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Could not load plan information.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, all subdomains, DNS records, API keys,
                  subscriptions, and uptime monitors. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:brightness-110"
                  onClick={async () => {
                    const res = await fetch("/api/user/account", { method: "DELETE" });
                    if (res.ok) {
                      await signOut({ callbackUrl: "/" });
                    }
                  }}
                >
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
