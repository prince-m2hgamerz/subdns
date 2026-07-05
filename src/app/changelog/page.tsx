import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Changelog — SubDNS",
  description: "Every update, every improvement, every fix that makes your free corner of the internet better. Transparent releases for a platform built for developers.",
};

const releases = [
  {
    version: "v2.1.0",
    date: "July 2, 2026",
    changes: [
      { type: "feature", text: "CLI — manage your corner of the internet from the terminal" },
      { type: "feature", text: "Live status page with real-time service monitoring" },
      { type: "improvement", text: "DNS propagation now under 30 seconds — changes hit the edge fast" },
      { type: "fix", text: "Rate limiting on bulk DNS operations is now rock-solid" },
    ],
  },
  {
    version: "v2.0.0",
    date: "June 15, 2026",
    changes: [
      { type: "feature", text: "Cloudflare proxy toggle — orange cloud protection for every subdomain" },
      { type: "feature", text: "API key management with granular, per-key permissions" },
      { type: "feature", text: "Webhooks — get notified the instant DNS changes" },
      { type: "improvement", text: "Redesigned dashboard with real-time updates across the board" },
    ],
  },
  {
    version: "v1.5.0",
    date: "May 20, 2026",
    changes: [
      { type: "feature", text: "SRV and CAA record support — more control, fewer limits" },
      { type: "feature", text: "Bulk DNS import and export — manage records at scale" },
      { type: "improvement", text: "Search and filtering across the dashboard is faster and smarter" },
    ],
  },
  {
    version: "v1.4.0",
    date: "April 10, 2026",
    changes: [
      { type: "feature", text: "Activity log — every change tracked, full audit trail" },
      { type: "improvement", text: "Subdomain availability checks are now near-instant" },
      { type: "fix", text: "TXT record validation now handles SPF entries correctly" },
    ],
  },
  {
    version: "v1.3.0",
    date: "March 1, 2026",
    changes: [
      { type: "feature", text: "MX record support — route email through your corner of the internet" },
      { type: "improvement", text: "Dashboard performance — faster loads, smoother interactions" },
      { type: "fix", text: "TTL handling for proxied records is now precise and correct" },
    ],
  },
  {
    version: "v1.2.0",
    date: "February 5, 2026",
    changes: [
      { type: "feature", text: "CNAME flattening — cleaner DNS, fewer edge cases" },
      { type: "feature", text: "Rate limit headers on every API response — full transparency" },
      { type: "fix", text: "Subdomain deletion now safely cascades to clean up DNS records" },
    ],
  },
];

const typeStyles: Record<string, string> = {
  feature: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  improvement: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  fix: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export default function ChangelogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="mx-auto max-w-3xl space-y-12 py-16 px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              We ship constantly to make your corner of the internet faster, more capable, and more delightful. Every feature, fix, and improvement is documented here — full transparency, always.
            </p>
          </div>

          <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-neutral-200 dark:before:bg-neutral-800">
            {releases.map((release) => (
              <div key={release.version} className="relative pl-10">
                <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-neutral-300 bg-background dark:border-neutral-600" />
                <div className="mb-1 flex items-baseline gap-3">
                  <h2 className="text-xl font-semibold">{release.version}</h2>
                  <span className="text-sm text-neutral-500">{release.date}</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {release.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span
                        className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium capitalize ${typeStyles[change.type]}`}
                      >
                        {change.type}
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
