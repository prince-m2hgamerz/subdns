"use client";

import { UserPlus, Globe, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up in Seconds",
    description:
      "Connect your Google or GitHub account — no credit card, no forms, no friction. SubDNS uses your existing identity so you can skip the password creation and get straight to building. Within seconds of authenticating, you land on your dashboard ready to claim your first subdomain. We believe the fastest onboarding is the one you barely notice.",
  },
  {
    icon: Globe,
    title: "Claim & Configure",
    description:
      "Choose any available subdomain under m2hio.in and point it where you need it. Our web dashboard, CLI, and REST API give you full control over A, AAAA, CNAME, TXT, MX, NS, and SRV records. Set TTLs, enable Cloudflare proxying for DDoS protection and CDN caching, or pass traffic straight through — every option is a click or a curl command away.",
  },
  {
    icon: ShieldCheck,
    title: "Go Live with SSL",
    description:
      "Wildcard SSL certificates are issued and renewed automatically through Cloudflare's edge network. Your subdomain is served over HTTPS from the moment it resolves — no Let's Encrypt setup, no certificate renewal reminders, no configuration. Just a green padlock and a fast, secure connection for every visitor, everywhere in the world.",
  },
];

export function WhySubDNS() {
  return (
    <section className="section-pad border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="display-lg">How SubDNS Works</h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Three steps to your own corner of the internet. No DevOps degree required.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex flex-col items-center text-center">
                <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Step {i + 1}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
