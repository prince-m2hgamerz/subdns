"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { WebhookRow, WebhookDelivery, DEVELOPER_WEBHOOK_EVENTS, DEVELOPER_EVENT_LABELS } from "@/lib/webhooks";
import { Loader2, Plus, Trash2, Play, Edit3, Globe, Key, Eye, EyeOff, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface WebhookForm {
  url: string;
  secret: string;
  max_retries: number;
  events: string[];
}

const defaultForm: WebhookForm = {
  url: "",
  secret: "",
  max_retries: 3,
  events: [],
};

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WebhookRow | null>(null);
  const [form, setForm] = useState<WebhookForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Record<string, WebhookDelivery[]>>({});
  const [deliveriesLoading, setDeliveriesLoading] = useState<string | null>(null);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/webhooks");
      const data = await res.json();
      setWebhooks(data.webhooks || []);
      setTotal(data.total || 0);
      setLimit(data.limit || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWebhooks(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (w: WebhookRow) => {
    setEditing(w);
    setForm({
      url: w.url,
      secret: "",
      max_retries: w.max_retries,
      events: [...w.events],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.url) {
      toast({ title: "Validation Error", description: "URL is required", variant: "destructive" });
      return;
    }
    if (form.events.length === 0) {
      toast({ title: "Validation Error", description: "Select at least one event", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        url: form.url,
        events: form.events,
        max_retries: form.max_retries,
      };
      if (form.secret) {
        body.secret = form.secret;
      } else if (editing) {
        body.secret = null;
      }

      const res = await fetch(
        editing ? `/api/webhooks/${editing.id}` : "/api/webhooks",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
      }

      toast({
        title: editing ? "Webhook Updated" : "Webhook Created",
        description: editing ? "Your webhook has been updated." : "Your new webhook has been created.",
        variant: "success",
      });
      setDialogOpen(false);
      fetchWebhooks();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    setToggling(id);
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: active }),
      });
      if (!res.ok) throw new Error("Failed to toggle webhook");
      toast({
        title: active ? "Webhook Activated" : "Webhook Deactivated",
        variant: "success",
      });
      fetchWebhooks();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to toggle",
        variant: "destructive",
      });
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this webhook? This action cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete webhook");
      toast({ title: "Webhook Deleted", variant: "success" });
      fetchWebhooks();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    try {
      const res = await fetch(`/api/webhooks/${id}/test`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        toast({
          title: "Test Successful",
          description: `Status ${data.status} (${data.duration_ms}ms)`,
          variant: "success",
        });
      } else {
        toast({
          title: "Test Failed",
          description: `Status ${data.status} (${data.duration_ms}ms)`,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Test Error",
        description: err instanceof Error ? err.message : "Failed to send test",
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const fetchDeliveries = async (webhookId: string) => {
    if (deliveries[webhookId]) return;
    setDeliveriesLoading(webhookId);
    try {
      const res = await fetch(`/api/webhooks/${webhookId}/deliveries`);
      if (res.ok) {
        const data = await res.json();
        setDeliveries((prev) => ({ ...prev, [webhookId]: data || [] }));
      }
    } catch {
      // silently fail
    } finally {
      setDeliveriesLoading(null);
    }
  };

  const toggleExpanded = (webhookId: string) => {
    if (expandedId === webhookId) {
      setExpandedId(null);
    } else {
      setExpandedId(webhookId);
      fetchDeliveries(webhookId);
    }
  };

  const handleRegenerateSecret = async (id: string) => {
    setRegenerating(id);
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regen_secret: true }),
      });
      if (!res.ok) throw new Error("Failed to regenerate secret");
      toast({ title: "Secret Regenerated", variant: "success" });
      fetchWebhooks();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to regenerate secret",
        variant: "destructive",
      });
    } finally {
      setRegenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground">
            Manage incoming webhook endpoints. {total} of {limit} used.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={openCreate}
          disabled={total >= limit}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Webhook
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12">
            <Globe className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium">No webhooks yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first webhook endpoint to receive events.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <CardTitle className="text-base truncate">{webhook.url}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={webhook.is_active ? "default" : "outline"}>
                      {webhook.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={webhook.is_active}
                      onCheckedChange={(checked) => handleToggle(webhook.id, checked)}
                      disabled={toggling === webhook.id}
                    />
                  </div>
                </div>
                <CardDescription className="flex flex-wrap gap-1 mt-2">
                  {webhook.events.map((event) => (
                    <Badge key={event} variant="outline" className="text-xs">
                      {DEVELOPER_EVENT_LABELS[event] || event}
                    </Badge>
                  ))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    {webhook.secret && (
                      <span className="flex items-center gap-1">
                        <Key className="h-3 w-3" />
                        {revealedSecret === webhook.id ? (
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{webhook.secret}</code>
                        ) : (
                          "Secret configured"
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() =>
                            setRevealedSecret(revealedSecret === webhook.id ? null : webhook.id)
                          }
                        >
                          {revealedSecret === webhook.id ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleRegenerateSecret(webhook.id)}
                          disabled={regenerating === webhook.id}
                        >
                          {regenerating === webhook.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                        </Button>
                      </span>
                    )}
                    <span>Max {webhook.max_retries} retries</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTest(webhook.id)}
                      disabled={testing === webhook.id}
                    >
                      {testing === webhook.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      Test
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(webhook)}>
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(webhook.id)}
                      disabled={deleting === webhook.id}
                    >
                      {deleting === webhook.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3 text-destructive" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-3 border-t pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-xs text-muted-foreground"
                    onClick={() => toggleExpanded(webhook.id)}
                  >
                    <span>Delivery Logs</span>
                    {expandedId === webhook.id ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                  {expandedId === webhook.id && (
                    <div className="mt-2 space-y-1">
                      {deliveriesLoading === webhook.id ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : (deliveries[webhook.id]?.length ?? 0) > 0 ? (
                        deliveries[webhook.id].map((delivery) => (
                          <div
                            key={delivery.id}
                            className="flex items-center justify-between rounded border px-3 py-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  delivery.ok ? "default" : "destructive"
                                }
                                className="text-[10px] px-1 py-0"
                              >
                                {delivery.status}
                              </Badge>
                              <span className="text-muted-foreground">
                                {delivery.status ?? "—"}
                              </span>
                            </div>
                            <span className="text-muted-foreground">
                              {new Date(delivery.created_at).toLocaleString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="py-2 text-center text-xs text-muted-foreground">
                          No deliveries yet
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Webhook" : "Create Webhook"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update your webhook endpoint settings."
                : "Add a new webhook endpoint to receive events."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://example.com/webhook"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret">
                Secret{" "}
                {editing && (
                  <span className="text-muted-foreground">(leave empty to keep current)</span>
                )}
              </Label>
              <Input
                id="secret"
                value={form.secret}
                onChange={(e) => setForm((f) => ({ ...f, secret: e.target.value }))}
                placeholder={editing ? "Enter new secret to change" : "Optional signing secret"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_retries">Max Retries</Label>
              <Select
                value={String(form.max_retries)}
                onValueChange={(v) => setForm((f) => ({ ...f, max_retries: Number(v) }))}
              >
                <SelectTrigger id="max_retries">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-lg border p-3">
                {DEVELOPER_WEBHOOK_EVENTS.map((event) => (
                  <label key={event} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={form.events.includes(event)}
                      onCheckedChange={(checked) => {
                        setForm((f) => ({
                          ...f,
                          events: checked
                            ? [...f.events, event]
                            : f.events.filter((e) => e !== event),
                        }));
                      }}
                    />
                    {DEVELOPER_EVENT_LABELS[event]}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Update Webhook" : "Create Webhook"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
