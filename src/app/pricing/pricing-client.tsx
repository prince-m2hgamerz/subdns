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
      </main>
      <Footer />
    </>
  );
}
