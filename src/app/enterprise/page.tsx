import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Shield, Users, Globe, Headphones, Building2, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Enterprise — SubDNS",
  description: "DNS infrastructure for organizations that need scale, security, and reliability. SSO, audit logs, dedicated infrastructure, and white-label domains for your team.",
  alternates: { canonical: "https://subdns.m2hio.in/enterprise" },
};

const benefits = [
  {
    icon: Shield,
    title: "Advanced Security",
    description: "SSO, SCIM provisioning, and full audit trails — available as part of the Enterprise plan. Your team's DNS managed with enterprise-grade guardrails.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Multi-user workspaces with granular permissions. Share subdomain pools across your whole org.",
  },
  {
    icon: Globe,
    title: "Custom Domain",
    description: "Use your own domain, not ours. Full white-label DNS infrastructure under your brand.",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description: "Dedicated Slack channel and a 4-hour SLA. We are here when you need us.",
  },
  {
    icon: Building2,
    title: "Dedicated Infrastructure",
    description: "Isolated Cloudflare configuration, guaranteed rate limits, and dedicated IPs — no noisy neighbors. Available on the Enterprise plan.",
  },
  {
    icon: Lock,
    title: "Compliance",
    description: "GDPR compliant by design. SOC 2 Type II audit available to Enterprise customers on request, with custom data processing agreements.",
  },
];

export default function EnterprisePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "SubDNS Enterprise",
    description: "DNS infrastructure for organizations that need scale, security, and reliability. SSO, audit logs, dedicated infrastructure, and white-label domains.",
    url: "https://subdns.m2hio.in/enterprise",
    offers: { "@type": "Offer", price: "Custom", priceCurrency: "USD" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="pt-16">
        <div className="section-pad">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="display-lg">Enterprise</h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                Your team needs more than free subdomains. SubDNS Enterprise gives you SSO, audit logs, dedicated infrastructure, and white-label domains — all backed by Cloudflare's global edge.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Link href="/contact">
                  <Button variant="primary" size="lg">
                    Contact Sales
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button variant="outline" size="lg">
                    View Documentation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b) => (
                <div key={b.title} className="rounded-md border border-border bg-card p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-alpha-200 bg-gray-100">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-border bg-card/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="display-sm">Enterprise Plan Overview</h2>
              <p className="mt-4 text-base text-muted-foreground">
                SubDNS starts free for individuals and small teams. The Enterprise plan adds dedicated infrastructure,
                advanced security controls, compliance documentation, and priority support — with pricing based on
                team size, subdomain volume, and infrastructure requirements.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-md border border-border bg-card p-4">
                  <div className="text-lg font-semibold text-foreground">Free</div>
                  <div className="mt-1 text-sm text-muted-foreground">Unlimited subdomains, full DNS control, CLI & API access — no cost.</div>
                </div>
                <div className="rounded-md border border-border bg-card p-4">
                  <div className="text-lg font-semibold text-foreground">Enterprise</div>
                  <div className="mt-1 text-sm text-muted-foreground">SSO, audit logs, compliance, dedicated infra, and priority support.</div>
                </div>
                <div className="rounded-md border border-border bg-card p-4">
                  <div className="text-lg font-semibold text-foreground">Custom</div>
                  <div className="mt-1 text-sm text-muted-foreground">Tailored for larger organizations. Volume pricing and dedicated onboarding.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="display-sm">Built for the teams building the future</h2>
              <p className="mt-4 text-base text-muted-foreground">
                Your corner of the internet deserves enterprise-grade infrastructure. Let us show you what SubDNS can do for your org.
              </p>
              <div className="mt-8">
                <Link href="/contact">
                  <Button variant="primary" size="lg">
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
