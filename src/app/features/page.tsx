import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Everything SubDNS — SubDNS",
  description: "Free subdomains on m2hio.in with full DNS control, Cloudflare global edge, CLI & API access, and developer-first tools.",
  alternates: { canonical: "https://subdns.m2hio.in/features" },
};

export default function FeaturesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Everything SubDNS — Features",
    description: "Free subdomains on m2hio.in with full DNS control, Cloudflare global edge, CLI & API access, and developer-first tools.",
    url: "https://subdns.m2hio.in/features",
    about: {
      "@type": "Thing",
      name: "SubDNS Features",
      description: "Free subdomain service with DNS management, Cloudflare proxy, CLI, API, and security tools.",
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="pt-16">
        <div className="section-pad">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="display-lg">Everything SubDNS</h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                Your free corner of the internet comes with enterprise-grade DNS — CLI, API, global edge proxy, and full record control. No credit card, no catch.
              </p>
            </div>
          </div>
        </div>
        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="display-sm text-center">Three Ways to Use SubDNS</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div className="rounded-md border border-border bg-card p-5">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Web UI</div>
                  <h3 className="font-semibold text-foreground">Dashboard-first</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Claim subdomains, manage DNS records, and monitor activity — all from your browser. No installation needed.</p>
                </div>
                <div className="rounded-md border border-border bg-card p-5">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">CLI</div>
                  <h3 className="font-semibold text-foreground">Terminal-native</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Manage everything from your command line. Ideal for developers who live in the terminal and want to script DNS operations.</p>
                </div>
                <div className="rounded-md border border-border bg-card p-5">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">API</div>
                  <h3 className="font-semibold text-foreground">Automation-ready</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Integrate DNS into your CI/CD pipeline, deployment scripts, or infrastructure-as-code workflows with our REST API and SDKs.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Features />
        <FeatureDetail />
      </main>
      <Footer />
    </>
  );
}

const details = [
  {
    title: "Subdomain Management",
    items: [
      "Claim your free corner — any available subdomain under m2hio.in",
      "Auto-configure CNAME targets in seconds",
      "Check availability in real time",
      "Provisioned instantly across Cloudflare's global edge",
      "Release, transfer, and reclaim with zero friction",
      "Bulk operations for power users and automation",
    ],
  },
  {
    title: "DNS Control",
    items: [
      "Full record types — A, AAAA, CNAME, TXT, MX, SRV, CAA",
      "Orange-cloud toggle for Cloudflare proxy and DDoS protection",
      "Custom TTL per record for precision control",
      "Search and filter across all your DNS records",
      "Batch add, edit, and delete operations",
      "Real-time propagation — changes take effect in seconds",
    ],
  },
  {
    title: "Security",
    items: [
      "Free auto-renewing SSL/TLS for every subdomain",
      "Enterprise DDoS protection backed by Cloudflare",
      "API key authentication for programmatic access",
      "Granular role-based access control",
      "Full audit trail — every change, who made it, when",
      "Rate limiting on all endpoints to keep the platform stable",
    ],
  },
  {
    title: "Developer Tools",
    items: [
      "REST API — script everything, automate anything",
      "CLI — manage DNS from your terminal, no UI required",
      "Webhooks — get notified the instant DNS changes",
      "Activity logs — full visibility into every action",
      "Multi-environment workflows for dev, staging, and prod",
      "CI/CD native — integrate DNS into your deployment pipeline",
    ],
  },
];

function FeatureDetail() {
  return (
    <section className="section-pad border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {details.map((group) => (
            <div key={group.title} className="rounded-md border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
