"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

type Settings = {
  siteName: string;
  siteDescription: string;
  registrationOpen: boolean;
  defaultSubdomainLimit: number;
  maxSubdomainLength: number;
  cloudflareEmail: string;
  cloudflareZoneId: string;
  cloudflareConfigured: boolean;
};

export default function AdminSettingsPage() {
  const { data: session, status: authStatus } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({
    siteName: "",
    siteDescription: "",
    registrationOpen: true,
    defaultSubdomainLimit: 10,
    maxSubdomainLength: 50,
    cloudflareEmail: "",
    cloudflareZoneId: "",
    cloudflareConfigured: false,
  });

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSettings(data.settings);
    } catch {
      redirect("/auth/login");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "unauthenticated") redirect("/auth/login");
    if (authStatus === "authenticated") fetchSettings();
  }, [authStatus, fetchSettings]);

  const saveSetting = async (key: string, value: unknown) => {
    setSaving(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Saved", description: `${key} updated successfully.`, variant: "success" });
    } catch {
      toast({ title: "Error", description: "Failed to save setting.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-5 w-32 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
                <div className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-neutral-500">Manage application settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Site Name</label>
            <Input
              value={settings.siteName}
              onChange={(e) => setSettings((prev) => ({ ...prev, siteName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Site Description</label>
            <Input
              value={settings.siteDescription}
              onChange={(e) => setSettings((prev) => ({ ...prev, siteDescription: e.target.value }))}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              disabled={saving === "siteName"}
              onClick={() =>
                saveSetting("siteName", settings.siteName).then(() =>
                  saveSetting("siteDescription", settings.siteDescription)
                )
              }
            >
              {saving === "siteName" ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Registration Open</span>
            <button
              role="switch"
              aria-checked={settings.registrationOpen}
              onClick={() => {
                const next = !settings.registrationOpen;
                setSettings((prev) => ({ ...prev, registrationOpen: next }));
                saveSetting("registrationOpen", next);
              }}
              className={`relative -m-2 p-2 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.registrationOpen
                  ? "bg-green-500"
                  : "bg-neutral-300 dark:bg-neutral-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.registrationOpen ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Subdomain Limit</label>
            <Input
              type="number"
              value={settings.defaultSubdomainLimit}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  defaultSubdomainLimit: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Subdomain Length</label>
            <Input
              type="number"
              value={settings.maxSubdomainLength}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  maxSubdomainLength: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              disabled={saving === "registration"}
              onClick={() => {
                saveSetting("defaultSubdomainLimit", settings.defaultSubdomainLimit);
                saveSetting("maxSubdomainLength", settings.maxSubdomainLength);
              }}
            >
              {saving === "registration" ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cloudflare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cloudflare Email</label>
            <div className="flex items-center gap-2">
              <Input
                value={settings.cloudflareEmail}
                readOnly
                className="opacity-60"
              />
              {settings.cloudflareConfigured && (
                <Badge variant="success">Configured</Badge>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Zone ID</label>
            <div className="flex items-center gap-2">
              <Input
                value={settings.cloudflareZoneId}
                readOnly
                className="opacity-60 font-mono"
              />
              {settings.cloudflareConfigured && (
                <Badge variant="success">Configured</Badge>
              )}
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Cloudflare credentials are managed via environment variables and cannot be changed here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reserved Names</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-neutral-500">
            Manage reserved subdomain names that cannot be registered by users.
          </p>
          <Link href="/admin/reserved">
            <Button variant="outline" size="sm">
              Manage Reserved Names
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
