"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { LiquidChrome } from "@/components/ui/liquid-chrome";

const capabilities = [
  "Subdomains",
  "DNS Control",
  "Security",
  "Edge Network",
  "CLI & API",
];

const headlineWords = [
  { text: "Your", animation: "hover:-translate-y-2 hover:text-emerald-400" },
  { text: "Home", animation: "hover:rotate-[-4deg] hover:text-blue-400" },
  { text: "On", animation: "hover:scale-125" },
  { text: "The", animation: "hover:skew-x-6" },
  { text: "Internet", animation: "hover:tracking-wider hover:text-emerald-400" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 md:pt-48 md:pb-24">
      <div className="pointer-events-none absolute inset-0 select-none">
        <LiquidChrome
          baseColor={[0.1, 0.12, 0.18]}
          speed={0.6}
          amplitude={0.5}
          interactive={true}
          distortionStrength={0.4}
          className="absolute inset-0 opacity-70"
        />
        <div className="absolute left-1/2 top-0 h-[700px] w-[1000px] -translate-x-1/2 bg-gradient-radial from-white/[0.07] via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-gray-100/60 px-3 py-1 text-xs text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Free forever · no credit card
          </div>

          <h1 className="display-xl text-foreground text-balance">
            {headlineWords.map((word, i) => (
              <span
                key={i}
                className={`inline-block cursor-default transition-all duration-300 ease-out will-change-transform ${word.animation}`}
              >
                {word.text}
                {i < headlineWords.length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl text-balance">
            Every developer deserves a corner of the internet to call their own. Claim your free subdomain on{" "}
            <span className="font-semibold text-foreground">m2hio.in</span> instantly.
            Full DNS control, Cloudflare proxying, and automatic SSL — all free, forever.
          </p>

          <div className="glass glass-hover mx-auto mt-10 max-w-lg rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/auth/register">
                <Button variant="primary" size="lg" className="group gap-2">
                  Claim Your Corner
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="secondary" size="lg">
                  Read the Docs
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              Instant DNS
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              Free SSL
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              No card required
            </span>
          </div>

          <div className="mt-12">
            <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground/70">
              Everything included
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {capabilities.map((cap) => (
                <span
                  key={cap}
                  className="inline-flex items-center rounded border border-border bg-gray-100/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}