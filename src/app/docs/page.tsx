import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Documentation — SubDNS",
  description:
    "Learn how to claim your free corner of the internet, manage DNS records, and automate everything with the SubDNS API.",
};

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
      <div className="mx-auto max-w-3xl space-y-12 py-16">
      <div className="space-y-4">
        <h1 className="display-lg">Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Claim your free corner under{" "}
          <code       className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
            m2hio.in
          </code>{" "}
          and manage DNS records through a simple API, CLI, or dashboard. Everything you need to make
          the internet yours.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="display-sm">Quick Start</h2>
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold">Claim your corner with a single curl</h3>
          </div>
          <div className="space-y-4 p-6">
            <pre className="overflow-x-auto rounded-lg bg-card p-4 text-sm leading-relaxed text-foreground">
              <code>{`curl -s -X POST https://subdns.m2hio.in/api/subdomains \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my-project", "domain": "m2hio.in", "type": "CNAME", "target": "my-project.vercel.app"}'`}</code>
            </pre>
            <p className="text-sm text-muted-foreground">
              Replace{" "}
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                my-project
              </code>{" "}
              with whatever name you want. If it is available, it is your corner of the internet — instantly.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="display-sm">Authentication</h2>
        <p className="text-muted-foreground">
          All API requests (except claiming) require authentication via an API key. Generate one from
          your dashboard under <strong>API Keys</strong>.
        </p>
        <pre className="overflow-x-auto rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground">
          <code>{`curl -s https://subdns.m2hio.in/api/subdomains \\
  -H "Authorization: Bearer <your-api-key>"`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="display-sm">DNS Record Types</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-5 py-3.5 text-left font-semibold text-foreground">Type</th>
                <th className="px-5 py-3.5 text-left font-semibold text-foreground">Example Value</th>
                <th className="px-5 py-3.5 text-left font-semibold text-foreground">Use Case</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: "A", example: "76.76.21.21", use: "IPv4 address" },
                { type: "AAAA", example: "::1", use: "IPv6 address" },
                { type: "CNAME", example: "my-app.vercel.app", use: "Alias to another domain" },
                {
                  type: "TXT",
                  example: "v=spf1 include:_spf.google.com ~all",
                  use: "Verification / SPF",
                },
                { type: "MX", example: "mail.example.com", use: "Email delivery" },
                { type: "SRV", example: "1 10 5060 sip.example.com", use: "Service discovery" },
                { type: "CAA", example: "0 issue letsencrypt.org", use: "CA authorization" },
              ].map((row) => (
                <tr key={row.type} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5 font-mono font-medium text-foreground">
                    {row.type}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                    {row.example}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="display-sm">API Endpoints</h2>
        <div className="space-y-3">
          {[
            {
              method: "POST",
              path: "/api/claim",
              desc: "Claim a new subdomain (public)",
            },
            { method: "GET", path: "/api/subdomains", desc: "List your subdomains" },
            { method: "GET", path: "/api/subdomains/[id]", desc: "Get subdomain details" },
            { method: "DELETE", path: "/api/subdomains/[id]", desc: "Release a subdomain" },
            {
              method: "GET",
              path: "/api/dns-records",
              desc: "List DNS records for a subdomain",
            },
            { method: "POST", path: "/api/dns-records", desc: "Create a DNS record" },
            { method: "PATCH", path: "/api/dns-records/[id]", desc: "Update a DNS record" },
            { method: "DELETE", path: "/api/dns-records/[id]", desc: "Delete a DNS record" },
          ].map((ep) => (
            <div
              key={`${ep.method}-${ep.path}`}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-gray-250 hover:shadow-sm"
            >
              <span className="shrink-0 rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xs font-medium text-primary">
                {ep.method}
              </span>
              <code className="font-mono text-sm text-foreground">{ep.path}</code>
              <span className="ml-auto text-sm text-muted-foreground">{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>
      </div>
      </main>
      <Footer />
    </>
  );
}
