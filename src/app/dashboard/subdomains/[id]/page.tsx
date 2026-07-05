"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Globe, Plus, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number | null;
  priority: number | null;
  proxied: boolean;
  status: string;
  cloudflareId: string | null;
  createdAt: string;
}

interface Subdomain {
  id: string;
  name: string;
  domain: string;
  target: string;
  type: string;
  proxied: boolean;
  status: string;
  dnsRecords: DnsRecord[];
}

export default function SubdomainDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [subdomain, setSubdomain] = useState<Subdomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchSubdomain = useCallback(async () => {
    try {
      const res = await fetch(`/api/subdomains/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setSubdomain(data.subdomain);
    } catch {
      setError("Failed to load subdomain");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSubdomain();
  }, [fetchSubdomain]);

  const handleDelete = async () => {
    if (!confirm("Delete this subdomain and all its DNS records?")) return;

    try {
      const res = await fetch(`/api/subdomains/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/dashboard/subdomains");
      router.refresh();
    } catch {
      setError("Failed to delete subdomain");
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !subdomain) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/subdomains">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">{error || "Subdomain not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/subdomains">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {subdomain.name}.{subdomain.domain}
            </h1>
            <p className="text-sm text-muted-foreground">{subdomain.target}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={subdomain.status === "ACTIVE" ? "default" : "outline"}>
            {subdomain.status}
          </Badge>
          {subdomain.proxied && <Badge variant="outline">Proxied</Badge>}
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> DNS Records
          </CardTitle>
          <AddRecordForm subdomainId={id} subdomainName={subdomain.name} onAdded={fetchSubdomain} />
        </CardHeader>
        <CardContent>
          {subdomain.dnsRecords.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No DNS records yet. Add your first record above.
            </p>
          ) : (
            <div className="space-y-2">
              {subdomain.dnsRecords.map((record, i) => (
                <DnsRecordRow
                  key={record.id}
                  record={record}
                  onDelete={fetchSubdomain}
                  copied={copiedIndex === i}
                  onCopy={() => copyToClipboard(record.content, i)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DnsRecordRow({
  record,
  onDelete,
  copied,
  onCopy,
}: {
  record: DnsRecord;
  onDelete: () => void;
  copied: boolean;
  onCopy: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/dns/${record.id}`, { method: "DELETE" });
      onDelete();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="w-16 justify-center font-mono text-xs">
          {record.type}
        </Badge>
        <div>
          <p className="font-mono text-sm">{record.content}</p>
          <p className="text-xs text-muted-foreground">
            TTL: {record.ttl ?? "Auto"}
            {record.priority ? ` | Priority: ${record.priority}` : ""}
            {record.proxied ? " | Proxied" : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function AddRecordForm({
  subdomainId,
  subdomainName,
  onAdded,
}: {
  subdomainId: string;
  subdomainName: string;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("A");
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("1");
  const [priority, setPriority] = useState("");
  const [proxied, setProxied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [srvService, setSrvService] = useState("");
  const [srvProtocol, setSrvProtocol] = useState("_tcp");
  const [srvWeight, setSrvWeight] = useState("1");
  const [srvPort, setSrvPort] = useState("");

  const showPriority = type === "MX" || type === "SRV";
  const showProxied = type === "A" || type === "AAAA" || type === "CNAME";

  const getContent = () => {
    if (type === "SRV") {
      return `${priority || "10"} ${srvWeight} ${srvPort} ${content}`;
    }
    return content;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content) {
      setError("Content is required");
      return;
    }

    if (type === "SRV") {
      if (!srvPort) {
        setError("Port is required for SRV records");
        return;
      }
      if (!srvService.startsWith("_")) {
        setError("Service must start with _ (e.g. _sip, _xmpp)");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomainId,
          type,
          name: type === "SRV" ? `${srvService}.${srvProtocol}.${subdomainName}` : undefined,
          content: getContent(),
          ttl: parseInt(ttl) || 1,
          ...(showPriority && priority ? { priority: parseInt(priority) } : {}),
          proxied: showProxied ? proxied : false,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add record");
        return;
      }

      setContent("");
      setType("A");
      setPriority("");
      setProxied(false);
      setSrvService("");
      setSrvProtocol("_tcp");
      setSrvWeight("1");
      setSrvPort("");
      setOpen(false);
      onAdded();
    } catch {
      setError("Failed to add record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(!open)}
      >
        <Plus className="h-4 w-4" /> Add Record
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add DNS Record</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="A">A</option>
                    <option value="AAAA">AAAA</option>
                    <option value="CNAME">CNAME</option>
                    <option value="TXT">TXT</option>
                    <option value="MX">MX</option>
                    <option value="SRV">SRV</option>
                    <option value="CAA">CAA</option>
                  </select>
                </div>

                {type === "SRV" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Service</label>
                        <Input
                          placeholder="_sip"
                          value={srvService}
                          onChange={(e) => setSrvService(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Protocol</label>
                        <select
                          value={srvProtocol}
                          onChange={(e) => setSrvProtocol(e.target.value)}
                          className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        >
                          <option value="_tcp">TCP</option>
                          <option value="_udp">UDP</option>
                          <option value="_tls">TLS</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Port</label>
                        <Input
                          placeholder="5060"
                          value={srvPort}
                          onChange={(e) => setSrvPort(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Weight</label>
                        <Input
                          placeholder="10"
                          value={srvWeight}
                          onChange={(e) => setSrvWeight(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {type !== "SRV" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Value</label>
                    <Input
                      placeholder={
                        type === "A"
                          ? "192.168.1.1"
                          : type === "AAAA"
                            ? "2001:db8::1"
                            : type === "CNAME"
                              ? "target.example.com"
                              : type === "MX"
                                ? "mail.example.com"
                                : type === "TXT"
                                  ? "v=spf1 include:_spf.example.com ~all"
                                  : type === "CAA"
                                    ? '0 issue "letsencrypt.org"'
                                    : "value"
                      }
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="font-mono"
                      required
                    />
                  </div>
                )}

                {type === "SRV" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target</label>
                    <Input
                      placeholder="sip.example.com"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="font-mono"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: priority weight port target → {priority || "10"} {srvWeight} {srvPort || "0"} {content || "target"}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">TTL (seconds)</label>
                    <select
                      value={ttl}
                      onChange={(e) => setTtl(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="1">Auto</option>
                      <option value="60">1 minute</option>
                      <option value="300">5 minutes</option>
                      <option value="3600">1 hour</option>
                      <option value="86400">1 day</option>
                    </select>
                  </div>
                  {showPriority && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Input
                        placeholder="10"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {showProxied && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={proxied}
                      onChange={(e) => setProxied(e.target.checked)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className="text-sm">Proxy through Cloudflare</span>
                  </label>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                    {loading ? "Adding..." : "Add Record"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
