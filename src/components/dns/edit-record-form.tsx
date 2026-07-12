"use client";

import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";
import { PresetSelector } from "./preset-selector";
import type { DnsRecord } from "./types";

const TTL_OPTIONS = [
  { label: "Auto", value: "1" },
  { label: "60 (1m)", value: "60" },
  { label: "300 (5m)", value: "300" },
  { label: "3600 (1h)", value: "3600" },
  { label: "86400 (1d)", value: "86400" },
];

interface Props {
  record: DnsRecord;
  subdomainName: string;
  onSaved: () => void;
  onCancel: () => void;
}

function parseSrvContent(c: string) {
  const parts = c.split(/\s+/);
  if (parts.length >= 4) return { priority: parts[0], weight: parts[1], port: parts[2], target: parts.slice(3).join(" ") };
  return { priority: "10", weight: "1", port: "", target: c };
}

export function EditRecordForm({ record, subdomainName, onSaved, onCancel }: Props) {
  const [type, setType] = useState(record.type);
  const [content, setContent] = useState(record.content || "");
  const [ttl, setTtl] = useState(String(record.ttl ?? "1"));
  const [priority, setPriority] = useState(String(record.priority ?? ""));
  const [proxied, setProxied] = useState(record.proxied ?? false);
  const [loading, setLoading] = useState(false);

  const srvParsed = parseSrvContent(content);
  const [srvService, setSrvService] = useState(type === "SRV" ? record.name?.split(".")[0] || "" : "");
  const [srvProtocol, setSrvProtocol] = useState(type === "SRV" ? record.name?.split(".")[1] || "_tcp" : "_tcp");
  const [srvWeight, setSrvWeight] = useState(srvParsed.weight);
  const [srvPort, setSrvPort] = useState(srvParsed.port);
  const [srvTarget, setSrvTarget] = useState(srvParsed.target);

  const isSrv = type === "SRV";
  const showPriority = type === "MX" || isSrv;
  const showProxied = type === "A" || type === "AAAA" || type === "CNAME";

  const getContent = () => {
    if (isSrv) return `${priority || "10"} ${srvWeight} ${srvPort} ${srvTarget}`;
    return content;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !isSrv) {
      toast({ title: "Missing fields", description: "Content is required.", variant: "destructive" });
      return;
    }
    if (isSrv && !srvPort) {
      toast({ title: "Missing field", description: "Port is required for SRV records.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/dns/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: isSrv ? `${srvService}.${srvProtocol}.${subdomainName}` : record.name,
          content: getContent(),
          ttl: parseInt(ttl) || 1,
          ...(showPriority && priority ? { priority: parseInt(priority) } : {}),
          proxied: showProxied ? proxied : false,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to update record (${res.status})`);
      }
      toast({ title: "Record updated", variant: "success" });
      onSaved();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onCancel} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-lg font-semibold">Edit DNS Record</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <PresetSelector
            subdomainName={subdomainName}
            onSelect={(p) => {
              setType(p.type);
              setContent(p.content);
              setTtl(String(p.ttl ?? "1"));
              setPriority(p.priority != null ? String(p.priority) : "");
              setProxied(p.proxied);
            }}
          />

          <hr className="border-border" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["A", "AAAA", "CNAME", "TXT", "MX", "SRV", "CAA"].map((t) => (
                    <SelectItem key={t} value={t}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">{t}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>TTL</Label>
              <Select value={ttl} onValueChange={setTtl}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TTL_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isSrv && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Input placeholder="_sip" value={srvService} onChange={(e) => setSrvService(e.target.value)} className="font-mono" required />
                </div>
                <div className="space-y-2">
                  <Label>Protocol</Label>
                  <Select value={srvProtocol} onValueChange={setSrvProtocol}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_tcp">TCP</SelectItem>
                      <SelectItem value="_udp">UDP</SelectItem>
                      <SelectItem value="_tls">TLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input type="number" placeholder="5060" value={srvPort} onChange={(e) => setSrvPort(e.target.value)} className="font-mono" required />
                </div>
                <div className="space-y-2">
                  <Label>Weight</Label>
                  <Input type="number" placeholder="10" value={srvWeight} onChange={(e) => setSrvWeight(e.target.value)} className="font-mono" />
                </div>
              </div>
            </>
          )}

          {!isSrv && (
            <div className="space-y-2">
              <Label>Value *</Label>
              <Input
                placeholder={
                  type === "A" ? "192.168.1.1"
                  : type === "AAAA" ? "2001:db8::1"
                  : type === "CNAME" ? "target.example.com"
                  : type === "MX" ? "mail.example.com"
                  : type === "TXT" ? 'v=spf1 include:_spf.example.com ~all'
                  : type === "CAA" ? '0 issue "letsencrypt.org"'
                  : "value"
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="font-mono"
                required
              />
            </div>
          )}

          {isSrv && (
            <div className="space-y-2">
              <Label>Target</Label>
              <Input placeholder="sip.example.com" value={srvTarget} onChange={(e) => setSrvTarget(e.target.value)} className="font-mono" required />
              <p className="text-xs text-muted-foreground">
                Format: priority weight port target → {priority || "10"} {srvWeight} {srvPort || "0"} {srvTarget || "target"}
              </p>
            </div>
          )}

          {showPriority && (
            <div className="space-y-2">
              <Label>Priority</Label>
              <Input type="number" placeholder="10" value={priority} onChange={(e) => setPriority(e.target.value)} />
            </div>
          )}

          {showProxied && (
            <div className="flex items-center gap-2">
              <Checkbox id="edit-proxied" checked={proxied} onCheckedChange={(v) => setProxied(v === true)} />
              <Label htmlFor="edit-proxied" className="cursor-pointer">Proxy through Cloudflare (orange cloud)</Label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
