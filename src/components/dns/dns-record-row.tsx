"use client";

import { useState } from "react";
import { Copy, Check, Trash2, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { EditRecordForm } from "./edit-record-form";
import type { DnsRecord } from "./types";

const PROXIABLE = ["A", "AAAA", "CNAME"];

const typeColors: Record<string, string> = {
  A: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  AAAA: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  CNAME: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  TXT: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  MX: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  SRV: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  CAA: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  NS: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

export function DnsRecordRow({
  record,
  subdomainName,
  domain,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
}: {
  record: DnsRecord;
  subdomainName: string;
  domain: string;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [propagating, setPropagating] = useState(false);
  const [propResult, setPropResult] = useState<{ resolved: boolean; ips: string[]; cloudflare: boolean } | null>(null);
  const [propError, setPropError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);

  const isProxiable = PROXIABLE.includes(record.type);

  const handleProxyToggle = async () => {
    setToggling(true);
    try {
      const res = await fetch(`/api/dns/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proxied: !record.proxied }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to toggle proxy (${res.status})`);
      }
      toast({ title: "Proxy updated", variant: "success" });
      onEdit();
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Could not toggle proxy", variant: "destructive" });
    } finally {
      setToggling(false);
    }
  };

  const doCopy = async () => {
    await navigator.clipboard.writeText(record.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const doDelete = async () => {
    if (!confirm(`Delete this ${record.type} record?`)) return;
    try {
      const res = await fetch(`/api/dns/${record.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Record deleted", variant: "success" });
      onDelete();
    } catch {
      toast({ title: "Error", description: "Failed to delete record", variant: "destructive" });
    }
  };

  const checkPropagation = async () => {
    setPropagating(true);
    setPropError(null);
    setPropResult(null);
    try {
      const res = await fetch(`/api/dns/${record.id}/propagation?domain=${encodeURIComponent(domain)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Propagation check failed (${res.status})`);
      }
      const data = await res.json();
      setPropResult(data);
    } catch (e) {
      setPropError(e instanceof Error ? e.message : "Could not check propagation");
    } finally {
      setPropagating(false);
    }
  };

  const displayValue = record.type === "SRV" && record.content
    ? record.content.replace(/\s+/g, " ").trim()
    : record.content;

  return (
    <TooltipProvider>
      <div className="group flex flex-col gap-2 border-b border-border/50 px-6 py-4 transition-colors hover:bg-muted/30 last:border-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center sm:flex-1 sm:min-w-0">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(record.id)}
            aria-label={`Select ${record.name || record.type} record`}
          />
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 sm:min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <Badge className={`font-mono text-[10px] px-2 py-0.5 ${typeColors[record.type] || ""}`} variant="default">
                {record.type}
              </Badge>
              {isProxiable && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant={record.proxied ? "default" : "outline"} className={`font-mono text-[10px] px-1.5 py-0 cursor-pointer ${record.proxied ? "" : "opacity-60"}`} onClick={handleProxyToggle}>
                      {toggling ? "..." : record.proxied ? "Proxied" : "DNS only"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Click to toggle — {record.proxied ? "currently proxied through Cloudflare" : "currently DNS resolution only"}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2 sm:min-w-0">
              {record.name && (
                <span className="text-sm font-medium text-foreground">{record.name}</span>
              )}
              <span className="hidden sm:inline text-muted-foreground shrink-0">→</span>
              <span className="font-mono text-sm text-muted-foreground break-all">{displayValue}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
          <span className="mr-1 text-xs tabular-nums text-muted-foreground">{record.ttl || "Auto"}s</span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={doCopy}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{copied ? "Copied!" : "Copy value"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={checkPropagation} disabled={propagating}>
                <RefreshCw className={`h-4 w-4 ${propagating ? "animate-spin" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Check propagation</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Edit record</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={doDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Delete record</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {(propagating || propResult || propError) && (
        <div className="flex items-center gap-2 border-b border-border/50 bg-muted/20 px-6 py-2">
          {propagating && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
          {propagating && <p className="text-xs text-muted-foreground">Checking propagation...</p>}
          {propResult && (
            <>
              <span className={`text-xs font-medium ${propResult.resolved ? "text-green-500" : "text-amber-500"}`}>
                {propResult.resolved ? "Resolved" : "Not resolved"}
              </span>
              {propResult.ips.length > 0 && (
                <span className="text-xs text-muted-foreground font-mono">{propResult.ips.join(", ")}</span>
              )}
              <span className="text-xs text-muted-foreground">
                {propResult.cloudflare ? "(via Cloudflare)" : "(direct)"}
              </span>
            </>
          )}
          {propError && <p className="text-xs text-destructive">{propError}</p>}
        </div>
      )}

      {editing && (
        <EditRecordForm
          record={record}
          subdomainName={subdomainName}
          onSaved={() => { setEditing(false); onEdit(); }}
          onCancel={() => setEditing(false)}
        />
      )}
    </TooltipProvider>
  );
}
