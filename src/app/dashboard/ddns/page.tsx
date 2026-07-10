"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Subdomain {
  id: string;
  name: string;
  domain: string;
  fullDomain: string;
  target: string;
  type: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
}

export default function DdnsPage() {
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [subRes, keyRes] = await Promise.all([
        fetch("/api/subdomains"),
        fetch("/api/api-keys"),
      ]);
      if (subRes.ok) {
        const data = await subRes.json();
        setSubdomains(data.subdomains || []);
      }
      if (keyRes.ok) {
        const data = await keyRes.json();
        setKeys(data.keys || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const aRecords = subdomains.filter((s) => s.type === "A" || s.type === "AAAA");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dynamic DNS</h1>
        <p className="text-sm text-muted-foreground">
          Auto-update A / AAAA records from your devices
        </p>
      </div>

      {keys.length === 0 && (
        <Card className="border-yellow-500">
          <CardContent className="py-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              You need at least one API key to use DDNS.{" "}
              <a href="/dashboard/api-keys" className="underline">
                Create one here
              </a>
              .
            </p>
          </CardContent>
        </Card>
      )}

      {aRecords.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Globe className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No A or AAAA records found. Create a subdomain with type A or AAAA first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {aRecords.map((sub) => (
            <Card key={sub.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-mono text-base">{sub.fullDomain}</CardTitle>
                    <CardDescription>
                      {sub.type} → {sub.target}
                    </CardDescription>
                  </div>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="curl">
                  <TabsList>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="ddclient">ddclient</TabsTrigger>
                    <TabsTrigger value="inadyn">inadyn</TabsTrigger>
                  </TabsList>

                  <TabsContent value="curl" className="mt-3">
                    {keys.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Replace <code className="rounded bg-muted px-1 py-0.5">YOUR_API_KEY</code> with your key.
                        </p>
                        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                          {`curl -s "https://subdns.app/api/ddns/update?hostname=${sub.fullDomain}&myip=AUTO" \\
  -H "Authorization: Bearer ${keys[0].key}"`}
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            copyToClipboard(
                              `curl -s "https://subdns.app/api/ddns/update?hostname=${sub.fullDomain}&myip=AUTO" -H "Authorization: Bearer ${keys[0].key}"`,
                              `curl-${sub.id}`
                            )
                          }
                        >
                          {copied === `curl-${sub.id}` ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          Copy
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="ddclient" className="mt-3">
                    {keys.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Add to <code className="rounded bg-muted px-1 py-0.5">/etc/ddclient/ddclient.conf</code>:
                        </p>
                        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`daemon=300
ssl=yes
protocol=dyndns2
use=web, web=checkip.amazonaws.com/
server=subdns.app/api/ddns/update
login=${keys[0].key}
password=${keys[0].key}
${sub.fullDomain}`}
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            copyToClipboard(
                              `daemon=300\nssl=yes\nprotocol=dyndns2\nuse=web, web=checkip.amazonaws.com/\nserver=subdns.app/api/ddns/update\nlogin=${keys[0].key}\npassword=${keys[0].key}\n${sub.fullDomain}`,
                              `ddclient-${sub.id}`
                            )
                          }
                        >
                          {copied === `ddclient-${sub.id}` ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          Copy
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="inadyn" className="mt-3">
                    {keys.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Add to <code className="rounded bg-muted px-1 py-0.5">/etc/inadyn.conf</code>:
                        </p>
                        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`period = 300
provider default {
  ssl = true
  protocol = dyndns2
  ddns-server = subdns.app
  ddns-path = /api/ddns/update
  username = ${keys[0].key}
  password = ${keys[0].key}
  hostname = ${sub.fullDomain}
}`}
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            copyToClipboard(
                              `period = 300\nprovider default {\n  ssl = true\n  protocol = dyndns2\n  ddns-server = subdns.app\n  ddns-path = /api/ddns/update\n  username = ${keys[0].key}\n  password = ${keys[0].key}\n  hostname = ${sub.fullDomain}\n}`,
                              `inadyn-${sub.id}`
                            )
                          }
                        >
                          {copied === `inadyn-${sub.id}` ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          Copy
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>REST API</CardTitle>
          <CardDescription>
            JSON endpoint for programmatic updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">POST /api/ddns/update</p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`curl -X POST "https://subdns.app/api/ddns/update" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"hostname": "myhost.example.com", "myip": "1.2.3.4", "type": "A"}'`}
            </pre>
          </div>

          <div className="rounded-lg border border-border p-3">
            <p className="mb-1 text-xs font-medium">Response codes (plain text)</p>
            <table className="w-full text-xs text-muted-foreground">
              <tbody>
                <tr><td className="pr-4 font-mono">good &lt;ip&gt;</td><td>Record updated</td></tr>
                <tr><td className="pr-4 font-mono">nochg &lt;ip&gt;</td><td>No change needed</td></tr>
                <tr><td className="pr-4 font-mono">badauth</td><td>Invalid API key</td></tr>
                <tr><td className="pr-4 font-mono">nohost</td><td>Hostname not found</td></tr>
                <tr><td className="pr-4 font-mono">notfqdn</td><td>Invalid hostname</td></tr>
              </tbody>
            </table>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() =>
              copyToClipboard(
                `https://subdns.app/api/ddns/update`,
                "endpoint"
              )
            }
          >
            {copied === "endpoint" ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            Copy Endpoint URL
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
