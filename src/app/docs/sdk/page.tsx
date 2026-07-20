"use client";

import { useState, useEffect } from "react";

const languages = [
  { id: "node", label: "Node.js" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "curl", label: "curl" },
] as const;

type Lang = (typeof languages)[number]["id"];

const examples: Record<Lang, { title: string; code: string }[]> = {
  node: [
    {
      title: "npm",
      code: "npm install @subdns/sdk",
    },
    {
      title: "pnpm",
      code: "pnpm add @subdns/sdk",
    },
    {
      title: "yarn",
      code: "yarn add @subdns/sdk",
    },
  ],
  python: [
    {
      title: "pip",
      code: "pip install subdns",
    },
    {
      title: "uv",
      code: "uv add subdns",
    },
  ],
  go: [
    {
      title: "go get",
      code: "go get github.com/subdns/sdk-go",
    },
  ],
  curl: [
    {
      title: "",
      code: "# curl is pre-installed on most systems.\n# No additional installation required.",
    },
  ],
};

const initExamples: Record<Lang, string> = {
  node: `import { SubDNS } from "@subdns/sdk";

const client = new SubDNS({
  apiKey: process.env.SUBDNS_API_KEY,
});`,
  python: `from subdns import SubDNS

client = SubDNS(
    api_key=os.environ["SUBDNS_API_KEY"]
)`,
  go: `import (
  "github.com/subdns/sdk-go"
)

client := subdns.NewClient(
  os.Getenv("SUBDNS_API_KEY"),
)`,
  curl: `# Store your API key for reuse
export SUBDNS_API_KEY="subdns_xxxxx"

# All requests use the Authorization header
BASE="https://subdns.m2hio.in"`,
};

const claimExamples: Record<Lang, string> = {
  node: `const subdomain = await client.subdomains.create({
  name: "my-project",
  type: "CNAME",
  target: "my-project.vercel.app",
});

console.log(subdomain.fullDomain);
// → "my-project.m2hio.in"`,
  python: `subdomain = client.subdomains.create(
    name="my-project",
    type="CNAME",
    target="my-project.vercel.app",
)

print(subdomain.full_domain)
# → "my-project.m2hio.in"`,
  go: `subdomain, err := client.Subdomains.Create(
  ctx,
  &subdns.CreateSubdomainInput{
    Name:   "my-project",
    Type:   subdns.RecordTypeCNAME,
    Target: "my-project.vercel.app",
  },
)
if err != nil {
  log.Fatal(err)
}
fmt.Println(subdomain.FullDomain)
// → "my-project.m2hio.in"`,
  curl: `curl -s $BASE/api/subdomains \\
  -H "Authorization: Bearer $SUBDNS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "my-project",
    "type": "CNAME",
    "target": "my-project.vercel.app"
  }'`,
};

const listExamples: Record<Lang, string> = {
  node: `const subdomains = await client.subdomains.list();

subdomains.forEach((sd) => {
  console.log(sd.fullDomain, sd.status);
});`,
  python: `subdomains = client.subdomains.list()

for sd in subdomains:
    print(sd.full_domain, sd.status)`,
  go: `subdomains, err := client.Subdomains.List(ctx)
if err != nil {
  log.Fatal(err)
}
for _, sd := range subdomains {
  fmt.Println(sd.FullDomain, sd.Status)
}`,
  curl: `curl -s $BASE/api/subdomains \\
  -H "Authorization: Bearer $SUBDNS_API_KEY"`,
};

const dnsExamples: Record<Lang, string> = {
  node: `const record = await client.dnsRecords.create({
  subdomainId: "clx...",
  type: "A",
  name: "www",
  content: "76.76.21.21",
  proxied: true,
});

console.log(record.id);`,
  python: `record = client.dns_records.create(
    subdomain_id="clx...",
    type="A",
    name="www",
    content="76.76.21.21",
    proxied=True,
)

print(record.id)`,
  go: `record, err := client.DnsRecords.Create(
  ctx,
  &subdns.CreateDnsRecordInput{
    SubdomainID: "clx...",
    Type:        subdns.RecordTypeA,
    Name:        "www",
    Content:     "76.76.21.21",
    Proxied:     true,
  },
)
if err != nil {
  log.Fatal(err)
}
fmt.Println(record.ID)`,
  curl: `curl -s $BASE/api/dns-records \\
  -H "Authorization: Bearer $SUBDNS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "subdomainId": "clx...",
    "type": "A",
    "name": "www",
    "content": "76.76.21.21",
    "proxied": true
  }'`,
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="absolute right-3 top-3 cursor-pointer rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-card hover:text-foreground"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-4">
      <pre className="overflow-x-auto text-sm leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
      {children}
    </code>
  );
}

export default function SdkDocsPage() {
  const [lang, setLang] = useState<Lang>("node");

  useEffect(() => {
    document.title = "SDK & API Reference — SubDNS";
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <h1 className="display-lg">SDK Reference</h1>
        <p className="text-lg text-muted-foreground">
          Integrate SubDNS into your own applications with official SDKs for Node.js, Python, and Go.
          Prefer raw HTTP? curl examples are included for every operation.
        </p>
      </div>

      <section className="section-pad">
        <h2 className="display-sm">Installation</h2>
        <p className="mt-4 text-muted-foreground">
          Choose your language:
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {languages.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setLang(opt.id)}
              className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                lang === opt.id
                  ? "border-primary bg-primary-muted text-primary shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-gray-300 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {examples[lang].map((m) => (
            <div key={m.title}>
              {m.title && (
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {m.title}
                </p>
              )}
              <CodeBlock code={m.code} />
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad">
        <h2 className="display-sm">Client Initialization</h2>
        <p className="mt-4 text-muted-foreground">
          Create a client instance with your API key. Generate one from your{" "}
          <a href="/dashboard/api-keys" className="text-primary underline underline-offset-2">
            dashboard
          </a>
          .
        </p>
        <CodeBlock code={initExamples[lang]} />
      </section>

      <section className="section-pad">
        <h2 className="display-sm">Claim a Subdomain</h2>
        <p className="mt-4 text-muted-foreground">
          Reserve a free subdomain and point it to your target. The response includes the full domain name and current status.
        </p>
        <CodeBlock code={claimExamples[lang]} />
      </section>

      <section className="section-pad">
        <h2 className="display-sm">List Subdomains</h2>
        <p className="mt-4 text-muted-foreground">
          Retrieve all subdomains registered to your account.
        </p>
        <CodeBlock code={listExamples[lang]} />
      </section>

      <section className="section-pad">
        <h2 className="display-sm">Manage DNS Records</h2>
        <p className="mt-4 text-muted-foreground">
          Add DNS records to a subdomain. Supported types: <InlineCode>A</InlineCode>,{" "}
          <InlineCode>AAAA</InlineCode>, <InlineCode>CNAME</InlineCode>,{" "}
          <InlineCode>TXT</InlineCode>, <InlineCode>MX</InlineCode>.
        </p>
        <CodeBlock code={dnsExamples[lang]} />
        <p className="mt-3 text-sm text-muted-foreground">
          Use the corresponding <InlineCode>update</InlineCode> / <InlineCode>delete</InlineCode>{" "}
          methods to modify or remove records by ID.
        </p>
      </section>
    </div>
  );
}
