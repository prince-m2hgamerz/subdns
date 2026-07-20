"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";

const codeExamples = [
  {
    lang: "cURL",
    code: `curl -H "Authorization: Bearer sdns_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \\
  https://subdns.m2hio.in/subdomains`,
  },
  {
    lang: "JavaScript",
    code: `const res = await fetch("https://subdns.m2hio.in/subdomains", {
  headers: { Authorization: "Bearer sdns_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
});
const data = await res.json();`,
  },
  {
    lang: "TypeScript",
    code: `const API_KEY = process.env.SUBDNS_API_KEY;

interface Subdomain {
  id: string;
  name: string;
  target_url: string;
  status: string;
}

const res = await fetch("https://subdns.m2hio.in/subdomains", {
  headers: { Authorization: \`Bearer \${API_KEY}\` },
});
const subdomains: Subdomain[] = await res.json();`,
  },
  {
    lang: "Python",
    code: `import requests

API_KEY = "sdns_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
headers = {"Authorization": f"Bearer {API_KEY}"}

res = requests.get("https://subdns.m2hio.in/subdomains", headers=headers)
subdomains = res.json()`,
  },
];

export default function DeveloperExamples() {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyCode = (lang: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(lang);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Code Examples</h1>
        <p className="text-sm text-muted-foreground">Quick-start code snippets in popular languages</p>
      </div>

      {codeExamples.map((example) => (
        <Card key={example.lang}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{example.lang}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => copyCode(example.lang, example.code)}
            >
              {copiedSnippet === example.lang ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiedSnippet === example.lang ? "Copied" : "Copy"}
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm font-mono">{example.code}</pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
