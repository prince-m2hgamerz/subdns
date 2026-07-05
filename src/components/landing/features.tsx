"use client";

import { Globe, Shield, Terminal, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const features = [
  {
    icon: Globe,
    title: "Your Corner, Instantly",
    description: "Pick any available subdomain under m2hio.in and go live in seconds. No forms, no approvals. Just you and your next project.",
    cta: "Claim yours",
    href: "/auth/register",
    image: "/card-images/card-your-corner.svg",
  },
  {
    icon: Shield,
    title: "Automatic SSL, Zero Effort",
    description: "Wildcard SSL certificates and Cloudflare proxying. Enterprise-grade security that just works — no configuration needed.",
    cta: "View docs",
    href: "/docs",
    image: "/card-images/card-ssl.svg",
  },
  {
    icon: Terminal,
    title: "Ship From the Terminal",
    description: "Create subdomains, manage DNS, and automate your entire workflow with our CLI and REST API. Programmatic control over everything.",
    cta: "API reference",
    href: "/docs/api",
    image: "/card-images/card-terminal.svg",
  },
];

export function Features() {
  return (
    <section className="section-pad border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="display-lg">Everything you need to build</h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            From personal projects to production apps — claim your place on the web with tools that just work.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass glass-hover group flex flex-col rounded-2xl p-6"
              >
                <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]">
                  <Icon className="h-4.5 w-4.5 text-[#888888]" />
                </div>
                <h3 className="text-lg font-semibold text-[#FFFFFF]">{feature.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#888888]">
                  {feature.description}
                </p>
                <Link
                  href={feature.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#FFFFFF] transition-all duration-200 hover:gap-2"
                >
                  {feature.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
