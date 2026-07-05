import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Download, Palette, Terminal, Type } from "lucide-react";

export const metadata: Metadata = {
  title: "Brand Assets — SubDNS",
  description: "Download SubDNS brand assets including logos, icons, color palette, and typography guidelines for use in your projects and presentations.",
};

const logos = [
  { name: "SubDNS Logo — Light", desc: "For use on dark backgrounds", format: "SVG" },
  { name: "SubDNS Logo — Dark", desc: "For use on light backgrounds", format: "SVG" },
  { name: "SubDNS Icon — Light", desc: "Square icon on dark background", format: "SVG" },
  { name: "SubDNS Icon — Dark", desc: "Square icon on light background", format: "SVG" },
];

const colors = [
  { name: "Foreground", hex: "#EDEDF0", usage: "Primary text and headings" },
  { name: "Background", hex: "#000000", usage: "Page background" },
  { name: "Accent", hex: "#6366F1", usage: "Links, buttons, interactive elements" },
  { name: "Muted", hex: "#888888", usage: "Secondary text and labels" },
];

export default function BrandPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="section-pad">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="display-lg">Brand Assets</h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                Logos, colors, and guidelines for using the SubDNS brand in your projects.
              </p>
            </div>
          </div>
        </div>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-alpha-200 bg-gray-100">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Logos</h2>
                  <p className="text-sm text-muted-foreground">Download official SubDNS logos for your presentations, articles, and integrations.</p>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {logos.map((logo) => (
                  <div key={logo.name} className="rounded-md border border-border bg-card p-5">
                    <div className="mb-3 flex h-20 items-center justify-center rounded border border-border bg-black">
                      <Terminal className="h-8 w-8 text-foreground" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{logo.name}</h3>
                    <p className="text-xs text-muted-foreground">{logo.desc}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{logo.format}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-alpha-200 bg-gray-100">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Color Palette</h2>
                  <p className="text-sm text-muted-foreground">Our brand colors and their usage guidelines.</p>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {colors.map((c) => (
                  <div key={c.name} className="rounded-md border border-border bg-card p-5">
                    <div className="mb-3 h-12 rounded border border-border" style={{ backgroundColor: c.hex }} />
                    <h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.hex}</p>
                    <p className="text-xs text-muted-foreground">{c.usage}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-alpha-200 bg-gray-100">
                  <Type className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Typography</h2>
                  <p className="text-sm text-muted-foreground">SubDNS uses Geist — a modern sans-serif typeface designed by Vercel.</p>
                </div>
              </div>
              <div className="mt-8 rounded-md border border-border bg-card p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Display (Geist Sans, 48px)</p>
                    <p className="text-4xl font-bold text-foreground" style={{ fontFamily: "Geist Sans" }}>Aa</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Heading (Geist Sans, 24px)</p>
                    <p className="text-2xl font-semibold text-foreground">The quick brown fox</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Body (Geist Sans, 14px)</p>
                    <p className="text-sm text-foreground">The quick brown fox jumps over the lazy dog. Every developer deserves a free corner of the internet.</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mono (Geist Mono, 14px)</p>
                    <p className="font-mono text-sm text-foreground">subdns.m2hio.in --cname my-project.vercel.app</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="display-sm">Usage Guidelines</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                You may use SubDNS brand assets to refer to our service in your own projects, articles, or integrations. Do not modify our logos, use them in a way that implies endorsement, or place them in contexts that could be considered misleading or defamatory.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Questions about brand usage? <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">Contact us</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
