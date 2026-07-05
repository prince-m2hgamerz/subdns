import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Everything SubDNS — SubDNS",
  description: "Free subdomains on m2hio.in with full DNS control, Cloudflare global edge, CLI & API access, and developer-first tools.",
};

export default function FeaturesPage() {
  return (
    <>
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
