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
  const { data: session, status, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [phone, setPhone] = useState(session?.user?.phone || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [error, setError] = useState("");
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<PlanId | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [kycLoading, setKycLoading] = useState(true);

  const isPhoneUser = !!session?.user?.phone;

  useEffect(() => {
    if (status === "authenticated" && session) {
      setName(session?.user?.name || "");
      setEmail(session?.user?.email || "");
      setPhone(session?.user?.phone || "");
    }
  }, [status, session]);

  useEffect(() => {
    fetch("/api/user/plan")
      .then((r) => r.json())
      .then((d) => { if (d.plan) setCurrentPlanId(d.plan); })
      .finally(() => setPlanLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/user/kyc")
      .then((r) => r.json())
      .then((d) => { if (d.verification) setKycStatus(d.verification.verification_status); })
      .finally(() => setKycLoading(false));
  }, []);

  const currentPlan = currentPlanId ? PLANS[currentPlanId] : null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const body: Record<string, string> = { name, phone };
      if (isPhoneUser && email !== session?.user?.email) {
        body.email = email;
      }

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        update();
        setName(name);
        setEmail(email);
        setPhone(phone);
        setSaved(true);
        setEmailSaved(true);
        setPhoneSaved(!!phone);
        setTimeout(() => { setSaved(false); setEmailSaved(false); setPhoneSaved(false); }, 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong");
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
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
              />
              <p className="text-xs text-muted-foreground">
                Used for SMS notifications
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isPhoneUser}
                className={!isPhoneUser ? "cursor-not-allowed opacity-60" : ""}
              />
              {isPhoneUser ? (
                <p className="text-xs text-muted-foreground">
                  {emailSaved ? "Email updated!" : "Set your email address to enable email notifications"}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : saved ? "Saved!" : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {kycLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : kycStatus === "verified" ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" /> Identity verified
            </div>
          ) : kycStatus === "pending" ? (
            <div className="space-y-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending Review</Badge>
              <p className="text-sm text-muted-foreground">Your KYC is under review. We&apos;ll notify you once it&apos;s approved.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Complete identity verification to enable full access.</p>
              <Link href="/dashboard/subdomains/new">
                <Button size="sm">Complete KYC</Button>
              </Link>
            </div>
          )}
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
