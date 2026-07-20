"use client";

import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

const osOptions = [
  { id: "npm", label: "npm" },
  { id: "macos", label: "macOS" },
  { id: "linux", label: "Linux" },
  { id: "windows", label: "Windows" },
] as const;

const installCommands: Record<string, { title: string; code: string }[]> = {
  npm: [
    { title: "npm", code: "npm install -g @subdns/cli" },
    { title: "pnpm", code: "pnpm add -g @subdns/cli" },
    { title: "yarn", code: "yarn global add @subdns/cli" },
  ],
  macos: [
    { title: "npm (recommended)", code: "npm install -g @subdns/cli" },
  ],
  linux: [
    { title: "npm (recommended)", code: "npm install -g @subdns/cli" },
  ],
  windows: [
    { title: "npm (recommended)", code: "npm install -g @subdns/cli" },
  ],
};

const commands = [
  {
    cmd: "subdns login",
    desc: "Authenticate and connect your CLI",
    example: "subdns login",
    group: "auth",
  },
  {
    cmd: "subdns claim <name>",
    desc: "Claim a free subdomain instantly",
    example: "subdns claim my-project",
    group: "subdomains",
  },
  {
    cmd: "subdns list",
    desc: "List all your claimed subdomains",
    example: "subdns list",
    group: "subdomains",
  },
  {
    cmd: "subdns info <domain>",
    desc: "View subdomain and DNS record details",
    example: "subdns info my-project.m2hio.in",
    group: "subdomains",
  },
  {
    cmd: "subdns release <domain>",
    desc: "Release a subdomain (irreversible)",
    example: "subdns release my-project.m2hio.in",
    group: "subdomains",
  },
  {
    cmd: "subdns dns add <domain>",
    desc: "Add a DNS record to a subdomain",
    example: "subdns dns add my-project.m2hio.in --type A --content 76.76.21.21",
    group: "dns",
  },
  {
    cmd: "subdns dns rm <record-id>",
    desc: "Remove a DNS record",
    example: "subdns dns rm clx...",
    group: "dns",
  },
  {
    cmd: "subdns logs",
    desc: "View activity log for your account",
    example: "subdns logs --limit 20",
    group: "other",
  },
];

const groups = [
  { key: "auth", label: "Authentication" },
  { key: "subdomains", label: "Subdomains" },
  { key: "dns", label: "DNS Records" },
  { key: "other", label: "Other" },
];

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

export default function CliDocsPage() {
  const [os, setOs] = useState("npm");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.cmd.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    document.title = "CLI Reference — SubDNS";
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <h1 className="display-lg">CLI Reference</h1>
        <p className="text-lg text-muted-foreground">
          The SubDNS CLI puts the full power of your free corner of the internet in your terminal. Claim subdomains, add DNS records, check logs — all without leaving your keyboard.
        </p>
      </div>

      <section className="section-pad">
        <h2 className="display-sm">Installation</h2>
        <p className="mt-4 text-muted-foreground">
          Choose your platform:
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {osOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setOs(opt.id)}
              className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                os === opt.id
                  ? "border-primary bg-primary-muted text-primary shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-gray-300 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {installCommands[os].map((m) => (
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

        <p className="mt-3 text-sm text-muted-foreground">
          Requires <span className="text-foreground">Node.js 18</span> or later.
        </p>
      </section>

      <section className="section-pad">
        <h2 className="display-sm">Authentication</h2>
        <p className="mt-4 text-muted-foreground">
          Generate an API key from your <a href="/dashboard/api-keys" className="text-primary underline underline-offset-2">dashboard</a>, then authenticate your CLI:
        </p>
        <CodeBlock code="subdns login subdns_xxxxxxxxxxxx" />
        <p className="mt-2 text-muted-foreground">
          The key is stored locally in <InlineCode>~/.config/subdns/config.json</InlineCode>. Run <InlineCode>subdns logout</InlineCode> to remove it.
        </p>
      </section>

      <section className="section-pad">
        <div className="flex items-center justify-between">
          <h2 className="display-sm">Commands</h2>
          <Badge variant="primary">{commands.length} total</Badge>
        </div>

        <div className="mt-4">
          <input
            type="text"
            placeholder="Search commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="mt-8 text-center text-muted-foreground">
            No commands match <InlineCode>{query}</InlineCode>
          </p>
        ) : (
          <div className="mt-6 space-y-8">
            {groups.map((group) => {
              const groupCommands = filtered.filter((c) => c.group === group.key);
              if (groupCommands.length === 0) return null;
              return (
                <div key={group.key} className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </h3>
                  <div className="space-y-3">
                    {groupCommands.map((c) => (
                      <div
                        key={c.cmd}
                        className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-gray-250 hover:shadow-sm"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                          <code className="shrink-0 font-mono text-sm font-semibold text-primary">
                            {c.cmd}
                          </code>
                          <span className="text-sm text-muted-foreground">{c.desc}</span>
                        </div>
                        <div className="group relative mt-2">
                          <pre className="overflow-x-auto rounded-lg bg-card p-3 text-xs leading-relaxed text-foreground">
                            <code>{`$ ${c.example}`}</code>
                          </pre>
                          <CopyButton text={`$ ${c.example}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="section-pad">
        <h2 className="display-sm">Global Flags</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-5 py-3.5 text-left font-semibold text-foreground">Flag</th>
                <th className="px-5 py-3.5 text-left font-semibold text-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { flag: "--json", desc: "Output results as JSON" },
                { flag: "--api-url", desc: "Custom API endpoint" },
                { flag: "--help", desc: "Display help information" },
              ].map((f) => (
                <tr key={f.flag} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5 font-mono text-foreground">{f.flag}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
