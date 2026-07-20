"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Trash2, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SCOPE_OPTIONS = [
  { value: "subdomains:read", label: "Subdomains (Read)" },
  { value: "subdomains:write", label: "Subdomains (Read/Write)" },
  { value: "dns:read", label: "DNS Records (Read)" },
  { value: "dns:write", label: "DNS Records (Read/Write)" },
  { value: "webhooks:read", label: "Webhooks (Read)" },
  { value: "webhooks:write", label: "Webhooks (Read/Write)" },
];

interface ApiKey {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  description: string;
  expiresAt: string | null;
  lastUsed: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyDescription, setKeyDescription] = useState("");
  const [keyScopes, setKeyScopes] = useState<string[]>([]);
  const [keyExpiresAt, setKeyExpiresAt] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editScopes, setEditScopes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/api-keys");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setKeys(data.keys);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;

    try {
      const body: Record<string, unknown> = { name: keyName };
      if (keyDescription) body.description = keyDescription;
      if (keyScopes.length > 0) body.scopes = keyScopes;
      if (keyExpiresAt) body.expiresAt = new Date(keyExpiresAt).toISOString();

      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setNewKey(data.key);
      setKeyName("");
      setKeyDescription("");
      setKeyScopes([]);
      setKeyExpiresAt("");
      setShowCreate(false);
      fetchKeys();
    } catch {
      // ignore
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await fetch(`/api/api-keys/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription, scopes: editScopes }),
      });
      setEditingKey(null);
      fetchKeys();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      fetchKeys();
    } catch {
      // ignore
    }
  };

  const toggleScope = (scope: string) => {
    setKeyScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const toggleEditScope = (scope: string) => {
    setEditScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isExpired = (expiresAt: string | null) =>
    expiresAt && new Date(expiresAt) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Manage keys for programmatic access
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="gap-2"
          onClick={() => setShowCreate(!showCreate)}
        >
          <Plus className="h-4 w-4" /> Create Key
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>New API Key</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Name</label>
                <Input
                  placeholder="e.g. Production CI/CD"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Optional description for this key"
                  value={keyDescription}
                  onChange={(e) => setKeyDescription(e.target.value)}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Scopes</label>
                <div className="flex flex-wrap gap-2">
                  {SCOPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleScope(opt.value)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        keyScopes.includes(opt.value)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-muted-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {keyScopes.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No scopes = full access (current behavior)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expires At (optional)</label>
                <Input
                  type="datetime-local"
                  value={keyExpiresAt}
                  onChange={(e) => setKeyExpiresAt(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Generate
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {newKey && (
        <Card className="border-yellow-500">
          <CardContent className="py-4">
            <p className="mb-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Copy this key now. It won&apos;t be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-muted px-3 py-2 text-sm">
                {newKey}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(newKey, "new")}
              >
                {copiedIndex === "new" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
          ) : keys.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No API keys yet.
            </p>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className={`rounded-lg border px-4 py-3 ${
                    isExpired(key.expiresAt) ? "border-red-300 bg-red-50 dark:bg-red-950/20" : "border-border"
                  }`}
                >
                  {editingKey === key.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Key name"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Scopes</label>
                        <div className="flex flex-wrap gap-2">
                          {SCOPE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => toggleEditScope(opt.value)}
                              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                editScopes.includes(opt.value)
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground hover:border-muted-foreground"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingKey(null)}>Cancel</Button>
                        <Button variant="primary" size="sm" onClick={() => handleUpdate(key.id)}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{key.name}</p>
                          {key.scopes.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {key.scopes.length} scope{key.scopes.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                          {isExpired(key.expiresAt) && (
                            <Badge variant="outline" className="border-red-300 text-red-600 text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>
                        {key.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{key.description}</p>
                        )}
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {key.key}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {key.scopes.map((s) => (
                            <Badge key={s} variant="info" className="text-[10px]">
                              {s}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                          <span>
                            {key.lastUsed
                              ? `Last used: ${new Date(key.lastUsed).toLocaleDateString()}`
                              : "Never used"}
                          </span>
                          {key.expiresAt && (
                            <span>
                              Expires: {new Date(key.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingKey(key.id);
                            setEditName(key.name);
                            setEditDescription(key.description);
                            setEditScopes(key.scopes);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDelete(key.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
