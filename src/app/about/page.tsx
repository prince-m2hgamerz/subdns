import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Terminal, Globe, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About — SubDNS",
  description: "SubDNS gives every developer a free corner of the internet. Learn about our mission, our team, and why we're building the future of DNS.",
  alternates: { canonical: "https://subdns.m2hio.in/about" },
};

const values = [
  {
    icon: Globe,
    title: "Open by Default",
    description: "Every developer deserves a free corner of the internet. No paywalls, no gatekeeping — just DNS that works, for everyone.",
  },
  {
    icon: Shield,
    title: "Radical Simplicity",
    description: "DNS shouldn't require a DevOps degree. We design every interaction to be obvious, fast, and frustration-free.",
  },
  {
    icon: Zap,
    title: "Performance First",
    description: "Your subdomain should load before your users blink. We optimize every layer — from Cloudflare's edge to our API — for speed.",
  },
  {
    icon: Terminal,
    title: "Developer Experience",
    description: "CLI, API, web UI — you choose how you work. We build tools that respect your time and your workflow.",
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "About SubDNS",
    description: "Every developer deserves a free home on the internet. Learn about our mission and values.",
    url: "https://subdns.m2hio.in/about",
    about: {
      "@type": "Organization",
      name: "SubDNS",
      description: "Free subdomains for developers on m2hio.in with instant DNS management, Cloudflare proxying, and automatic SSL.",
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
              <h1 className="display-lg">About SubDNS</h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                Every developer deserves a free home on the internet. We're building the simplest, fastest way to claim your corner of the web — with full DNS control on the global edge.
              </p>
            </div>
          </div>
        </div>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <h2 className="display-sm">Our Mission</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                The internet is the greatest platform for human creativity ever built. But claiming your own corner of it has become harder, not easier. DNS configurations, domain registrations, SSL certificates — the friction adds up.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                SubDNS exists to remove that friction. We give every developer a free subdomain on m2hio.in with instant DNS management, Cloudflare proxying, and automatic SSL — all through a CLI, API, or web interface. No credit card required. No hidden catches.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                What started as a side project to scratch our own itch has grown into a platform serving thousands of developers worldwide — from solo hackers deploying personal projects to teams managing subdomain pools for their entire organization.
              </p>
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <h2 className="display-sm">The Story Behind SubDNS</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                SubDNS started in early 2024 as a simple itch. We were tired of the friction every developer faces when they want to put something on the internet — buying domains, configuring DNS, setting up SSL. What should take seconds was taking hours, and what should be free was costing money.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                So we built what we wished existed: a subdomain service that took your GitHub or Google identity, gave you a subdomain instantly, and hooked into Cloudflare's edge network for DNS resolution, DDoS protection, and automatic SSL — all without a credit card or a single support ticket. What started as a tool for ourselves quickly attracted beta users from Hacker News and developer communities who wanted the same simplicity.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                By mid-2024 we had processed thousands of subdomain registrations. Developers were using SubDNS for personal portfolios, staging environments, API endpoints, static sites, and experimental side projects they would never have deployed if they had to go through the traditional domain setup process. That confirmed what we suspected: lowering the barrier to owning a piece of the internet unlocks creativity that would otherwise stay on a laptop.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Today SubDNS serves developers from over a hundred countries. The platform has grown beyond its original CLI into a full web dashboard and REST API, supporting advanced DNS record types, team subdomain pooling, and real-time propagation logging. The core mission has not changed: give every developer a free, fast, and frustration-free corner of the internet.
              </p>
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="display-sm text-center">What We Believe</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {values.map((v) => (
                <div key={v.title} className="rounded-md border border-border bg-card p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-alpha-200 bg-gray-100">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="display-sm">Start Building</h2>
              <p className="mt-4 text-base text-muted-foreground">
                Claim your free subdomain in seconds. No credit card, no commitment — just your corner of the internet.
              </p>
              <div className="mt-8">
                <Link href="/auth/register">
                  <Button variant="primary" size="lg">Claim Your Subdomain</Button>
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
