"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface Sdk {
  name: string;
  lang: string;
  install: string;
  desc: string;
}

const sdks: Sdk[] = [
  { name: "Node.js / TypeScript", lang: "bash", install: "npm install subdns-sdk", desc: "Native async/await support with full TypeScript types. Works with Node 18+ and all modern frameworks." },
  { name: "Python", lang: "bash", install: "pip install subdns-sdk", desc: "Async and sync clients. Type-annotated, compatible with Python 3.9+ and frameworks like FastAPI." },
  { name: "Go", lang: "bash", install: "go get github.com/subdns/sdk-go", desc: "Idiomatic Go client with context support, connection pooling, and retry logic built in." },
  { name: "Rust", lang: "bash", install: "cargo add subdns-sdk", desc: "High-performance async client leveraging hyper and tokio for maximum throughput." },
  { name: "curl", lang: "bash", install: "# No install required — just curl!\ncurl -H \"Authorization: Bearer sdns_xxx\" \\\n  https://subdns.m2hio.in/api/v1/subdomains", desc: "Quick test any endpoint directly from your terminal using curl." },
];

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-100 dark:bg-black"><code>{code}</code></pre>
    </div>
  );
}

export default function SdksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SDKs & Libraries</h1>
        <p className="text-muted-foreground">Official client libraries maintained by the SubDNS team.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sdks.map((sdk) => (
          <Card key={sdk.name} className="sm:col-span-2 xl:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">{sdk.name}</CardTitle>
              <CardDescription>{sdk.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={sdk.install} language={sdk.lang} />
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        All SDKs are open source. Missing a language? {" "}
        <a href="#" className="text-primary underline underline-offset-4">Request it on GitHub</a>.
      </p>
    </div>
  );
}
