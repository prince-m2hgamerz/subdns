"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, ShieldBan } from "lucide-react";

const HARDCODED_RESERVED = [
  "admin", "mail", "ftp", "root", "localhost", "www", "support", "abuse",
  "api", "cloudflare", "vercel", "ns1", "ns2", "ns3", "ns4", "smtp", "imap",
  "pop3", "blog", "help", "status", "docs", "dev", "staging", "test", "demo",
  "app", "dashboard", "console", "cdn", "assets", "static", "media", "img",
  "css", "js", "fonts",
];

type DbEntry = { id: string; name: string };

export default function AdminReservedPage() {
  const { status } = useSession();
  const [dbEntries, setDbEntries] = useState<DbEntry[]>([]);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReserved = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reserved");
      if (!res.ok) throw new Error("Failed to fetch");
      setDbEntries(await res.json());
    } catch {
      redirect("/auth/login");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/login");
    if (status === "authenticated") fetchReserved();
  }, [status, fetchReserved]);

  const addName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/reserved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const created: DbEntry = await res.json();
      setDbEntries((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } finally {
      setSaving(false);
    }
  };

  const deleteName = async (id: string) => {
    if (!confirm("Remove this reserved name?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/reserved/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDbEntries((prev) => prev.filter((e) => e.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const dbNames = new Set(dbEntries.map((r) => r.name.toLowerCase()));

  const hardcodedNames = HARDCODED_RESERVED.filter((n) => !dbNames.has(n));

  const mergedReserved = [
    ...hardcodedNames.map((n) => ({ name: n, reason: "Hardcoded" as const })),
    ...dbEntries.map((r) => ({ name: r.name, reason: "Database" as const, id: r.id })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-900" />
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
          <h1 className="text-2xl font-bold">Reserved Names</h1>
          <p className="text-sm text-neutral-500">
            {mergedReserved.length} names blocked from registration
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Reserved Name</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addName} className="flex gap-2">
            <Input
              placeholder="Enter a name to reserve..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit" disabled={saving}>
              <Plus size={14} className="mr-1" />
              {saving ? "Adding..." : "Add"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {mergedReserved.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldBan className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
            <p className="text-sm text-neutral-500">No reserved names configured.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Reserved Subdomain Names</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mergedReserved.map((r) => {
                const dbEntry = dbEntries.find((e) => e.name === r.name);
                return (
                  <Badge
                    key={r.name}
                    variant="outline"
                    className="group relative pr-2 font-mono text-xs"
                  >
                    {r.name}
                    {dbEntry && (
                      <button
                        onClick={() => deleteName(dbEntry.id)}
                        disabled={deleting === dbEntry.id}
                        className="ml-1.5 inline md:invisible md:group-hover:visible text-neutral-400 hover:text-red-500 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
