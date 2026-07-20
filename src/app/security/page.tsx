import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Server, Key, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Security — SubDNS",
  description: "SubDNS takes security seriously. Learn about our encryption practices, infrastructure security, compliance certifications, and how we protect your data.",
};

const practices = [
  {
    icon: Lock,
    title: "Encryption at Rest & In Transit",
    description: "All data is encrypted using AES-256 at rest and TLS 1.3 in transit. Your DNS records, account data, and API tokens are protected end-to-end.",
  },
  {
    icon: Key,
    title: "API Token Authentication",
    description: "All API and CLI access requires scoped API tokens. Tokens can be created with specific permissions and revoked individually at any time.",
  },
  {
    icon: Eye,
    title: "Minimal Data Collection",
    description: "We only collect data necessary to provide our service. No tracking, no analytics cookies, no selling of personal information. See our Privacy Policy for details.",
  },
  {
    icon: Server,
    title: "Cloudflare Edge Infrastructure",
    description: "SubDNS runs entirely on Cloudflare's global network. Every request is filtered through Cloudflare's DDoS mitigation, WAF, and bot management before reaching our origin.",
  },
  {
    icon: Shield,
    title: "Automatic SSL/TLS",
    description: "Every subdomain gets free, auto-renewing SSL/TLS certificates via Cloudflare. HTTPS is enabled by default — no configuration required.",
  },
  {
    icon: FileCheck,
    title: "Regular Audits",
    description: "We conduct regular security audits, dependency scans, and penetration testing. Our code is open source and reviewed by the community.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="section-pad">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="display-lg">Security</h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                Your data and infrastructure are our responsibility. We build SubDNS with security at every layer.
              </p>
            </div>
          </div>
        </div>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {practices.map((p) => (
                <div key={p.title} className="rounded-md border border-border bg-card p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-alpha-200 bg-gray-100">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="display-sm">Infrastructure &amp; Compliance</h2>
              <div className="mt-8 space-y-4">
                <div className="rounded-md border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">TLS 1.3 &amp; Cipher Suites</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">All connections to SubDNS require TLS 1.2 or 1.3. We enforce strong cipher suites and disable deprecated protocols (SSLv3, TLS 1.0, TLS 1.1). Certificate management is fully automated through Cloudflare — every subdomain receives a shared or dedicated certificate that renews automatically before expiration.</p>
                </div>
                <div className="rounded-md border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">Data Storage &amp; Encryption</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Account data, DNS record configurations, and API tokens are stored encrypted at rest using AES-256. We use Cloudflare D1 for primary storage with automated backups. API tokens are hashed before storage — plaintext tokens are shown only once at creation. We do not log DNS query contents or monitor the traffic flowing through your subdomains.</p>
                </div>
                <div className="rounded-md border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">Network &amp; Edge Security</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">SubDNS runs entirely on Cloudflare Workers and Cloudflare's global edge network. All traffic passes through Cloudflare's Web Application Firewall (WAF), DDoS mitigation, and bot management before reaching our services. We enable rate limiting on all API endpoints to prevent abuse, and we monitor for suspicious patterns continuously.</p>
                </div>
                <div className="rounded-md border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">Service Level &amp; Uptime</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">The DNS control plane (dashboard, CLI, API) targets 99.9% uptime. DNS resolution for your subdomains is handled by Cloudflare's global anycast network, which has a proven 100% uptime track record. Status monitoring and incident communication are available at /status.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <h2 className="display-sm">Responsible Disclosure</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                If you discover a security vulnerability in SubDNS, we encourage you to report it responsibly. We commit to acknowledging your report within 24 hours and working with you to resolve the issue promptly.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Please report security issues to <Link href="mailto:security@subdns.m2hio.in" className="underline underline-offset-2 hover:text-foreground">security@subdns.m2hio.in</Link>. We do not currently operate a bug bounty program, but we will publicly acknowledge responsible disclosures.
              </p>
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="display-sm">Questions?</h2>
              <p className="mt-4 text-base text-muted-foreground">
                Have a security question or want to learn more about our practices? We'd love to hear from you.
              </p>
              <div className="mt-8">
                <Link href="/contact">
                  <Button variant="primary" size="lg">Contact Us</Button>
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
