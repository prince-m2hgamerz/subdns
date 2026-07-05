import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Shield, Users, Globe, Headphones, Building2, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Enterprise — SubDNS",
  description: "DNS infrastructure for organizations that need scale, security, and reliability. SSO, audit logs, dedicated infrastructure, and white-label domains for your team.",
};

const benefits = [
  {
    icon: Shield,
    title: "Advanced Security",
    description: "SSO, SCIM provisioning, and full audit trails. Your team's DNS managed with enterprise-grade guardrails.",
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
    description: "Isolated Cloudflare configuration, guaranteed rate limits, and dedicated IPs — no noisy neighbors.",
  },
  {
    icon: Lock,
    title: "Compliance",
    description: "SOC 2 Type II, GDPR compliant, with custom data processing agreements on request.",
  },
];

export default function EnterprisePage() {
  return (
    <>
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
