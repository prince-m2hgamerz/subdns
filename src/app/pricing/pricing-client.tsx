"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PLANS, type Plan } from "@/lib/plans";

type DisplayPlan = Plan & {
  name: string;
  description: string;
  price: number;
  priceDisplay: string;
  features: string[];
};

const planMeta: Record<string, { cta: string; featured: boolean; tag?: string; href: string }> = {
  BRONZE: { cta: "Claim Your Corner", featured: false, href: "/auth/register" },
  SILVER: { cta: "Go Silver", featured: true, tag: "Most Popular", href: "/auth/register" },
  GOLD: { cta: "Go Gold", featured: false, href: "/auth/register" },
};

export function PricingPage() {
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => setPlans(data.plans ?? []))
      .catch(() => setPlans(Object.values(PLANS) as DisplayPlan[]))
      .finally(() => setLoading(false));
  }, []);

  const display = loading ? (Object.values(PLANS) as DisplayPlan[]) : plans;

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
              {display.map((plan) => {
                const meta = planMeta[plan.id] ?? { cta: "Get Started", featured: false, href: "/auth/register" };

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-md border p-6 ${
                      meta.featured
                        ? "border-foreground/20 bg-card shadow-border"
                        : "border-border bg-card"
                    }`}
                  >
                    {meta.tag && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-0.5 text-xs font-medium text-background">
                        {meta.tag}
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">{plan.priceDisplay}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    <ul className="mt-6 space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href={meta.href} className="mt-8 block">
                      <Button variant={meta.featured ? "primary" : "outline"} className="w-full">
                        {meta.cta}
                      </Button>
                    </Link>
                  </div>
                );
              })}
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

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="display-sm text-center">Plan Comparison FAQ</h2>
              <div className="mt-8 space-y-4">
                <div className="rounded-md border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">Can I upgrade from Bronze to Silver without losing my subdomains?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Yes. Upgrading preserves all existing subdomains and DNS records. You gain access to additional features immediately, and your billing is prorated for the remainder of the month.</p>
                </div>
                <div className="rounded-md border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">What happens if I downgrade or cancel?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">You keep access until the end of your billing cycle. After that, your account reverts to Bronze limits. If you exceed Bronze limits, we will notify you before any action is taken, giving you time to upgrade or clean up unused subdomains.</p>
                </div>
                <div className="rounded-md border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">Is there a free trial for Silver or Gold?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Bronze is always free and includes 2 subdomains with basic DNS records. Silver and Gold do not offer a free trial, but you can start on Bronze and upgrade at any time — all your configuration carries over.</p>
                </div>
                <div className="rounded-md border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">Which plan supports Cloudflare proxying (orange cloud)?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Cloudflare proxy — which provides DDoS protection, SSL, and CDN caching — is available on Silver and above. Bronze records are DNS-only. If you need proxying for a single production site, Silver is the right plan.</p>
                </div>
                <div className="rounded-md border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">Can I pay annually for a discount?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Not yet, but annual billing is on our roadmap. Follow our changelog or contact us to be notified when it ships.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
