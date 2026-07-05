import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing — SubDNS",
  description: "Your free corner of the internet starts at $0. Simple, transparent pricing for subdomain and DNS management — no surprises, no hidden fees.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    desc: "Claim your corner of the internet — no credit card, no catch.",
    features: [
      "Up to 5 subdomains",
      "50 DNS records",
      "All DNS record types",
      "Cloudflare proxy (orange cloud)",
      "REST API access",
      "Community support",
    ],
    cta: "Claim Your Corner",
    href: "/auth/register",
    featured: false,
  },
  {
    name: "Pro",
    price: "$9",
    desc: "More corners, more control — for professionals who ship.",
    features: [
      "Up to 50 subdomains",
      "500 DNS records",
      "All DNS record types",
      "Cloudflare proxy (orange cloud)",
      "REST API + CLI access",
      "Activity logs (30-day retention)",
      "Webhook notifications",
      "Email support",
    ],
    cta: "Go Pro",
    href: "/auth/register",
    featured: true,
  },
  {
    name: "Team",
    price: "$29",
    desc: "Collaborate at scale with shared workspaces and priority support.",
    features: [
      "Up to 250 subdomains",
      "2,500 DNS records",
      "All DNS record types",
      "Cloudflare proxy (orange cloud)",
      "REST API + CLI access",
      "Activity logs (90-day retention)",
      "Webhook notifications",
      "Team workspaces",
      "Priority support",
    ],
    cta: "Start Team Plan",
    href: "/auth/register",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="section-pad">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="display-lg">Simple Pricing</h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                Every developer deserves a free corner of the internet. Start there. Upgrade when you need more. No surprises, no fine print.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-md border p-6 ${
                    plan.featured
                      ? "border-foreground/20 bg-card shadow-border"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-0.5 text-xs font-medium text-background">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="mt-8 block">
                    <Button variant={plan.featured ? "primary" : "outline"} className="w-full">
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Need more corners?{" "}
              <Link href="/enterprise" className="underline underline-offset-2 hover:text-foreground">
                Talk to us about Enterprise
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
