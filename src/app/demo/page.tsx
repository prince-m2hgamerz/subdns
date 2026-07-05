import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Play, Terminal, Globe, Code, Zap, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Get a Demo — SubDNS",
  description: "See SubDNS in action. Get a live walkthrough of subdomain management, DNS control, CLI tools, and Cloudflare edge features.",
};

const steps = [
  {
    icon: Globe,
    title: "1. Claim Your Subdomain",
    description: "Pick any available name on m2hio.in. Your corner of the internet with instant DNS control.",
  },
  {
    icon: Code,
    title: "2. Configure DNS Records",
    description: "Add A, CNAME, TXT, MX, or AAAA records through our web UI, CLI, or REST API.",
  },
  {
    icon: Zap,
    title: "3. Deploy & Scale",
    description: "Enable Cloudflare proxy for DDoS protection, automatic SSL, and global edge delivery.",
  },
  {
    icon: Terminal,
    title: "4. Manage Programmatically",
    description: "Use our CLI for terminal workflows or our API for CI/CD pipelines and automation.",
  },
];

export default function DemoPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="section-pad">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
                <Play className="h-3.5 w-3.5" />
                See SubDNS in action
              </div>
              <h1 className="display-lg">See How SubDNS Works</h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                From claiming your subdomain to managing DNS records on the global edge — get a live walkthrough of everything SubDNS can do.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Link href="/auth/register">
                  <Button variant="primary" size="lg">Try It Free</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">Book a Walkthrough</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div key={step.title} className="rounded-md border border-border bg-card p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-alpha-200 bg-gray-100">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="display-sm">What You Can Do</h2>
              <div className="mt-8 space-y-4 text-left">
                <div className="rounded-md border border-border bg-card p-4">
                  <p className="text-sm font-medium text-foreground">Personal Projects</p>
                  <p className="text-sm text-muted-foreground">Deploy your portfolio, blog, or side project on a free subdomain with instant SSL.</p>
                </div>
                <div className="rounded-md border border-border bg-card p-4">
                  <p className="text-sm font-medium text-foreground">Developer Tools</p>
                  <p className="text-sm text-muted-foreground">Use subdomains for API endpoints, preview deployments, or dynamic DNS.</p>
                </div>
                <div className="rounded-md border border-border bg-card p-4">
                  <p className="text-sm font-medium text-foreground">Team Workspaces</p>
                  <p className="text-sm text-muted-foreground">Share subdomain pools across your team with granular permissions and audit logs.</p>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/auth/register" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline underline-offset-4">
                  Get started for free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="display-sm">Ready to Try It?</h2>
              <p className="mt-4 text-base text-muted-foreground">
                No credit card required. Claim your free subdomain in seconds and start building.
              </p>
              <div className="mt-8">
                <Link href="/auth/register">
                  <Button variant="primary" size="lg">Claim Your Free Subdomain</Button>
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
