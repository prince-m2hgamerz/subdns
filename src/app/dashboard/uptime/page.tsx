"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Plus, Trash2, Play, Pause, ExternalLink, RefreshCw, Clock, Activity } from "lucide-react";

interface Subdomain {
  id: string;
  name: string;
}

interface Monitor {
  id: string;
  subdomainId: string;
  label: string;
  url: string;
  checkInterval: number;
  timeout: number;
  isActive: boolean;
  lastStatus: string | null;
  lastCheckedAt: string | null;
  uptimePercentage: number;
  subdomainName: string | null;
  createdAt: string;
}

export default function UptimePage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subdomainId: "", label: "", url: "", checkInterval: 5, timeout: 30 });
  const [creating, setCreating] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [createError, setCreateError] = useState("");

  const fetchMonitors = useCallback(() => {
    fetch("/api/uptime")
      .then((r) => r.json())
      .then((res) => { if (res.success) setMonitors(res.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMonitors();
    fetch("/api/subdomains")
      .then((r) => r.json())
      .then((res) => { if (res.subdomains) setSubdomains(res.subdomains); })
      .catch(() => {});
  }, [fetchMonitors]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.subdomainId) errors.subdomainId = "Select a subdomain";
    if (!form.label.trim()) errors.label = "Label is required";
    if (!form.url.trim()) errors.url = "URL is required";
    else if (!/^https?:\/\/.+/.test(form.url)) errors.url = "Enter a valid URL (http:// or https://)";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    setCreateError("");
    if (!validate()) return;
    setCreating(true);
    const res = await fetch("/api/uptime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCreating(false);
    if (data.success) {
      setShowForm(false);
      setForm({ subdomainId: "", label: "", url: "", checkInterval: 5, timeout: 30 });
      setFormErrors({});
      fetchMonitors();
    } else {
      setCreateError(data.error || "Failed to create monitor");
    }
  };

  const updateField = (field: string, value: string | number) => {
    setForm({ ...form, [field]: value });
    if (formErrors[field]) setFormErrors({ ...formErrors, [field]: "" });
  };

  const handleToggle = async (id: string) => {
    await fetch(`/api/uptime/${id}`, { method: "PATCH" });
    fetchMonitors();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/uptime/${id}`, { method: "DELETE" });
    fetchMonitors();
  };

  const handleRunCheck = async (id: string) => {
    setCheckingId(id);
    await fetch(`/api/uptime/${id}`, { method: "POST" });
    setCheckingId(null);
    fetchMonitors();
  };

  const daysAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    return Math.floor(diff / 86400000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Uptime Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor your subdomains and get notified on downtime</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Monitor
        </Button>
      </div>

      {showForm && (
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-medium">New Monitor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subdomain</Label>
              <Select value={form.subdomainId} onValueChange={(v) => updateField("subdomainId", v)}>
                <SelectTrigger className={formErrors.subdomainId ? "border-danger" : ""}><SelectValue placeholder="Select subdomain" /></SelectTrigger>
                <SelectContent>
                  {subdomains.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No subdomains found</div>
                  ) : (
                    subdomains.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formErrors.subdomainId && <p className="text-xs text-danger">{formErrors.subdomainId}</p>}
            </div>
            <div className="space-y-2">
              <Label>Label</Label>
              <Input value={form.label} onChange={(e) => updateField("label", e.target.value)} placeholder="e.g. API Server" className={formErrors.label ? "border-danger" : ""} />
              {formErrors.label && <p className="text-xs text-danger">{formErrors.label}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>URL to Monitor</Label>
              <Input value={form.url} onChange={(e) => updateField("url", e.target.value)} placeholder="https://your-subdomain.example.com" className={formErrors.url ? "border-danger" : ""} />
              {formErrors.url && <p className="text-xs text-danger">{formErrors.url}</p>}
            </div>
            <div className="space-y-2">
              <Label>Check Interval (minutes)</Label>
              <Input type="number" value={form.checkInterval} onChange={(e) => updateField("checkInterval", Number(e.target.value))} min={1} />
            </div>
            <div className="space-y-2">
              <Label>Timeout (seconds)</Label>
              <Input type="number" value={form.timeout} onChange={(e) => updateField("timeout", Number(e.target.value))} min={5} max={120} />
            </div>
          </div>
          {createError && <p className="text-sm text-danger">{createError}</p>}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create Monitor"}
            </Button>
            <Button variant="ghost" onClick={() => { setShowForm(false); setFormErrors({}); setCreateError(""); }}>Cancel</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading monitors...</div>
      ) : monitors.length === 0 ? (
        <Card className="p-12 text-center">
          <HeartPulse className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No monitors yet. Add one to start tracking uptime.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {monitors.map((m) => {
            const isUp = m.lastStatus === "UP";
            const isDown = m.lastStatus === "DOWN";
            const isRunning = checkingId === m.id;
            return (
              <Card key={m.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${isUp ? "bg-green-500" : isDown ? "bg-red-500" : "bg-gray-400"}`} />
                      <h3 className="font-medium truncate">{m.label}</h3>
                      <Badge variant={isUp ? "success" : isDown ? "destructive" : "outline"} className="text-[10px] h-4 px-1.5">
                        {m.lastStatus || "UNKNOWN"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{m.url}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {m.subdomainName && <span>{m.subdomainName}</span>}
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {m.uptimePercentage}% uptime
                      </span>
                      {m.lastCheckedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {daysAgo(m.lastCheckedAt)}d ago
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleRunCheck(m.id)} disabled={isRunning} title="Run check">
                      <RefreshCw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleToggle(m.id)} title={m.isActive ? "Pause" : "Resume"}>
                      {m.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(m.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
