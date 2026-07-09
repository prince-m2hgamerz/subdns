"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Globe, Trash2, Search } from "lucide-react";

type Subdomain = {
  id: string;
  name: string;
  domain: string;
};

type DnsRecord = {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  priority: number | null;
  proxied: boolean;
  status: string;
  created_at: string;
  subdomain_id: string;
  subdomain?: { name: string; domain: string; user_id: string } | null;
};

type FormFields = {
  subdomainId: string;
  type: string;
  name: string;
  content: string;
  ttl: string;
  priority: string;
  proxied: boolean;
  service: string;
  protocol: string;
  weight: string;
  port: string;
  target: string;
  tag: string;
  flags: string;
};

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "CAA"] as const;

const TYPE_HELP: Record<string, string> = {
  A: "Maps a name to an IPv4 address",
  AAAA: "Maps a name to an IPv6 address",
  CNAME: "Alias of one name to another",
  MX: "Mail exchange server for email routing",
  TXT: "Arbitrary text data for verification or policies",
  SRV: "Service locator for specific protocols",
  CAA: "Certification Authority Authorization",
};

const initialForm: FormFields = {
  subdomainId: "",
  type: "A",
  name: "",
  content: "",
  ttl: "1",
  priority: "",
  proxied: false,
  service: "",
  protocol: "",
  weight: "",
  port: "",
  target: "",
  tag: "issue",
  flags: "0",
};

function buildContent(type: string, fields: FormFields): string {
  switch (type) {
    case "A":
    case "AAAA":
    case "CNAME":
    case "TXT":
      return fields.content;
    case "MX":
      return fields.content;
    case "SRV":
      return `${fields.priority || "10"} ${fields.weight || "1"} ${fields.port || "80"} ${fields.target}`;
    case "CAA":
      return `${fields.flags || "0"} ${fields.tag} "${fields.content}"`;
    default:
      return fields.content;
  }
}

export default function AdminDnsPage() {
  const { status } = useSession();
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormFields>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [recordsRes, subsRes] = await Promise.all([
        fetch("/api/admin/dns"),
        fetch("/api/admin/subdomains"),
      ]);
      if (!recordsRes.ok || !subsRes.ok) throw new Error("Failed to fetch");
      setRecords(await recordsRes.json());
      const subs: Subdomain[] = await subsRes.json();
      setSubdomains(subs);
      if (subs.length > 0 && !form.subdomainId) {
        setForm((f) => ({ ...f, subdomainId: subs[0].id }));
      }
    } catch {
      redirect("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [form.subdomainId]);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/login");
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  const updateField = (key: keyof FormFields, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({ ...initialForm, subdomainId: subdomains[0]?.id || "" });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.subdomainId) {
      setError("Please select a subdomain");
      return;
    }

    const content = buildContent(form.type, form);
    if (!content.trim()) {
      setError("Please fill in the required content field");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        subdomainId: form.subdomainId,
        type: form.type,
        name: form.name || undefined,
        content,
        ttl: parseInt(form.ttl) || 1,
        proxied: form.proxied,
      };
      if (form.priority) body.priority = parseInt(form.priority);

      const res = await fetch("/api/admin/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create record");
        return;
      }

      setRecords((prev) => [data.record, ...prev]);
      setShowForm(false);
      resetForm();
    } catch {
      setError("Failed to create DNS record");
    } finally {
      setSaving(false);
    }
  };

  const subdomainLabel = (s: Subdomain) => `${s.name}.${s.domain}`;

  const filteredRecords = records.filter((r) => {
    const matchesSearch = !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.content.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeFields = (() => {
    switch (form.type) {
      case "A":
        return (
          <>
            <div>
              <Label>IPv4 Address</Label>
              <Input
                placeholder="192.0.2.1"
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                required
              />
            </div>
          </>
        );
      case "AAAA":
        return (
          <>
            <div>
              <Label>IPv6 Address</Label>
              <Input
                placeholder="2001:db8::1"
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                required
              />
            </div>
          </>
        );
      case "CNAME":
        return (
          <>
            <div>
              <Label>Target</Label>
              <Input
                placeholder="target.example.com"
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                required
              />
            </div>
          </>
        );
      case "MX":
        return (
          <>
            <div>
              <Label>Mail Server</Label>
              <Input
                placeholder="mail.example.com"
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Input
                type="number"
                placeholder="10"
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
              />
            </div>
          </>
        );
      case "TXT":
        return (
          <>
            <div>
              <Label>Value</Label>
              <Input
                placeholder="v=spf1 include:_spf.example.com ~all"
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                required
              />
            </div>
          </>
        );
      case "SRV":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Service</Label>
                <Input
                  placeholder="_sip"
                  value={form.service}
                  onChange={(e) => updateField("service", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Protocol</Label>
                <Select value={form.protocol} onValueChange={(v) => updateField("protocol", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Protocol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tcp">TCP</SelectItem>
                    <SelectItem value="udp">UDP</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Name (optional)</Label>
              <Input
                placeholder="Leave blank for root"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Priority</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={form.priority}
                  onChange={(e) => updateField("priority", e.target.value)}
                />
              </div>
              <div>
                <Label>Weight</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={form.weight}
                  onChange={(e) => updateField("weight", e.target.value)}
                />
              </div>
              <div>
                <Label>Port</Label>
                <Input
                  type="number"
                  placeholder="5060"
                  value={form.port}
                  onChange={(e) => updateField("port", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Target</Label>
              <Input
                placeholder="sip.example.com"
                value={form.target}
                onChange={(e) => updateField("target", e.target.value)}
                required
              />
            </div>
          </>
        );
      case "CAA":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tag</Label>
                <Select value={form.tag} onValueChange={(v) => updateField("tag", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="issue">issue</SelectItem>
                    <SelectItem value="issuewild">issuewild</SelectItem>
                    <SelectItem value="iodef">iodef</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Flags</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.flags}
                  onChange={(e) => updateField("flags", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                placeholder="letsencrypt.org"
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
                required
              />
            </div>
          </>
        );
      default:
        return (
          <div>
            <Label>Content</Label>
            <Input
              placeholder="Record value"
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
              required
            />
          </div>
        );
    }
  })();

  const canProxy = ["A", "AAAA", "CNAME"].includes(form.type);

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">DNS Records</h1>
          <p className="text-sm text-neutral-500">
            Manage all DNS records across subdomains
          </p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); resetForm(); }}>
          <Plus size={16} className="mr-1" />
          New Record
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create DNS Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Record Type</Label>
                  <Select value={form.type} onValueChange={(v) => updateField("type", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECORD_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-neutral-500">{TYPE_HELP[form.type]}</p>
                </div>
                <div>
                  <Label>Subdomain</Label>
                  <Select value={form.subdomainId} onValueChange={(v) => updateField("subdomainId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subdomain" />
                    </SelectTrigger>
                    <SelectContent>
                      {subdomains.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {subdomainLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.type !== "SRV" && (
                <div>
                  <Label>Name (optional — defaults to subdomain name)</Label>
                  <Input
                    placeholder="www or @ for root"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </div>
              )}

              {typeFields}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>TTL (seconds)</Label>
                  <Select value={form.ttl} onValueChange={(v) => updateField("ttl", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Auto</SelectItem>
                      <SelectItem value="120">2 min</SelectItem>
                      <SelectItem value="300">5 min</SelectItem>
                      <SelectItem value="600">10 min</SelectItem>
                      <SelectItem value="1800">30 min</SelectItem>
                      <SelectItem value="3600">1 hour</SelectItem>
                      <SelectItem value="7200">2 hours</SelectItem>
                      <SelectItem value="86400">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {canProxy && (
                  <div className="flex items-end pb-2">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="proxied"
                        checked={form.proxied}
                        onCheckedChange={(v) => updateField("proxied", v)}
                      />
                      <Label htmlFor="proxied">Proxy (Cloudflare CDN)</Label>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Create Record"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search records..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            {RECORD_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
            <p className="text-sm text-neutral-500">
              {records.length === 0 ? "No DNS records found." : "No records match your search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-neutral-50 dark:bg-neutral-900">
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Type</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Content</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Subdomain</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">TTL</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="font-mono">{r.type}</Badge>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs">
                    {r.name}
                  </td>
                  <td className="max-w-[250px] truncate px-4 py-3 font-mono text-xs text-neutral-600">
                    {r.content}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600">
                    {r.subdomain ? `${r.subdomain.name}.${r.subdomain.domain}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {r.ttl === 1 ? "Auto" : `${r.ttl}s`}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={r.status === "ACTIVE" ? "success" : "outline"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="cursor-pointer text-neutral-400 hover:text-red-500"
                      title="Delete record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
