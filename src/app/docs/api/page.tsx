import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference — SubDNS",
  description:
    "Complete API reference for the SubDNS REST API. Claim your corner, manage DNS records, and automate everything programmatically.",
};

const endpoints = [
  {
    method: "POST",
    path: "/api/subdomains",
    auth: "Required",
    desc: "Create a subdomain",
    body: `{
  "subdomain": "my-project",
  "name": "my-project",
  "domain": "m2hio.in",
  "type": "CNAME",
  "target": "my-project.vercel.app"
}`,
    resp: `{
  "id": "clx...",
  "name": "my-project",
  "fullDomain": "my-project.m2hio.in",
  "type": "CNAME",
  "target": "my-project.vercel.app",
  "status": "ACTIVE"
}`,
  },
  {
    method: "GET",
    path: "/api/subdomains",
    auth: "Bearer token",
    desc: "List all your subdomains",
    resp: `[
  {
    "id": "clx...",
    "name": "my-project",
    "fullDomain": "my-project.m2hio.in",
    "status": "ACTIVE",
    "createdAt": "2026-07-04T..."
  }
]`,
  },
  {
    method: "GET",
    path: "/api/subdomains/[id]",
    auth: "Bearer token",
    desc: "Get subdomain details with DNS records",
    resp: `{
  "id": "clx...",
  "name": "my-project",
  "fullDomain": "my-project.m2hio.in",
  "status": "ACTIVE",
  "dnsRecords": [...]
}`,
  },
  {
    method: "DELETE",
    path: "/api/subdomains/[id]",
    auth: "Bearer token",
    desc: "Release a subdomain (irreversible)",
    resp: `{ "success": true }`,
  },
  {
    method: "GET",
    path: "/api/dns-records?subdomainId=[id]",
    auth: "Bearer token",
    desc: "List DNS records for a subdomain",
    resp: `[
  {
    "id": "clx...",
    "type": "A",
    "name": "www",
    "content": "76.76.21.21",
    "ttl": 1,
    "proxied": true
  }
]`,
  },
  {
    method: "POST",
    path: "/api/dns-records",
    auth: "Bearer token",
    desc: "Create a new DNS record",
    body: `{
  "subdomainId": "clx...",
  "type": "CNAME",
  "name": "www",
  "content": "my-project.vercel.app",
  "ttl": 1,
  "proxied": true
}`,
    resp: `{
  "id": "clx...",
  "type": "CNAME",
  "name": "www",
  "content": "my-project.vercel.app",
  "status": "ACTIVE"
}`,
  },
  {
    method: "PATCH",
    path: "/api/dns-records/[id]",
    auth: "Bearer token",
    desc: "Update a DNS record",
    body: `{
  "content": "76.76.21.98",
  "proxied": false
}`,
    resp: `{ "id": "clx...", "content": "76.76.21.98", "proxied": false }`,
  },
  {
    method: "DELETE",
    path: "/api/dns-records/[id]",
    auth: "Bearer token",
    desc: "Delete a DNS record",
    resp: `{ "success": true }`,
  },
];

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
      {children}
    </code>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <h1 className="display-lg">API Reference</h1>
            <p className="text-lg text-muted-foreground">
              The SubDNS REST API lets you claim your corner, manage subdomains, and configure DNS
              records — all from the comfort of your terminal. Include your API key in the{" "}
              <InlineCode>Authorization</InlineCode> header for authenticated requests.
            </p>
          </div>

          <section className="section-pad">
            <h2 className="display-sm">Authentication</h2>
            <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground">
              <code>{`curl -s https://subdns.m2hio.in/api/subdomains \\
  -H "Authorization: Bearer <your-api-key>"`}</code>
            </pre>
            <p className="mt-3 text-sm text-muted-foreground">
              Generate an API key from your dashboard under <strong>API Keys</strong>. Keep your key
              secret — anyone with it can manage your subdomains.
            </p>
          </section>

          <section className="section-pad">
            <h2 className="display-sm">Base URL</h2>
            <div className="mt-4 rounded-xl border border-border bg-card p-4">
              <code className="text-sm text-foreground">https://subdns.m2hio.in</code>
            </div>
          </section>

          <section className="section-pad">
            <h2 className="display-sm">Errors</h2>
            <p className="mt-4 text-muted-foreground">
              The API returns conventional HTTP status codes:
            </p>
            <div className="mt-3 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="px-5 py-3.5 text-left font-semibold text-foreground">Code</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-foreground">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: "200", meaning: "Success" },
                    { code: "400", meaning: "Bad request — invalid input" },
                    { code: "401", meaning: "Unauthorized — missing or invalid API key" },
                    { code: "403", meaning: "Forbidden — insufficient permissions" },
                    { code: "404", meaning: "Not found" },
                    { code: "429", meaning: "Rate limit exceeded" },
                  ].map((e) => (
                    <tr key={e.code} className="border-b border-border last:border-0">
                      <td className="px-5 py-3.5 font-mono text-foreground">{e.code}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{e.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section-pad">
            <h2 className="display-sm">Endpoints</h2>
            <div className="mt-4 space-y-8">
              {endpoints.map((ep) => (
                <div key={ep.path} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xs font-medium text-primary">
                      {ep.method}
                    </span>
                    <code className="font-mono text-base text-foreground">{ep.path}</code>
                    <span className="ml-auto text-sm text-muted-foreground">{ep.desc}</span>
                  </div>

                  <div className="rounded-xl border border-border bg-card">
                    {ep.body && (
                      <div className="border-b border-border p-5">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Request Body
                        </p>
                        <pre className="overflow-x-auto text-sm leading-relaxed text-foreground">
                          <code>{ep.body}</code>
                        </pre>
                      </div>
                    )}
                    {ep.auth && (
                      <div className="border-b border-border p-5">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Auth
                        </p>
                        <code className="text-sm text-foreground">{ep.auth}</code>
                      </div>
                    )}
                    <div className="p-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Response
                      </p>
                      <pre className="overflow-x-auto text-sm leading-relaxed text-foreground">
                        <code>{ep.resp}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section-pad">
            <h2 className="display-sm">Rate Limiting</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              API requests are rate limited to 60 requests per minute per API key. Exceeding this
              limit returns a <InlineCode>429</InlineCode> status.
            </p>
          </section>
        </div>
  );
}
