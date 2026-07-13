import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Changelog — SubDNS",
  description:
    "Every update, every improvement, every fix that makes your free corner of the internet better. Transparent releases for a platform built for developers.",
};

const releases = [
  {
    version: "v2.3.0",
    date: "July 13, 2026",
    changes: [
      {
        type: "feature",
        text: "KYC verification — securely verify your identity with built-in KYC support and status tracking.",
      },
      {
        type: "feature",
        text: "User agreements — accept and manage Terms of Service, Privacy Policy, and future agreements in one place.",
      },
      {
        type: "feature",
        text: "Ownership certificates — generate beautifully designed, cryptographically signed PDF certificates for every subdomain.",
      },
      {
        type: "feature",
        text: "Certificate verification portal — publicly verify the authenticity of ownership certificates with a unique verification code.",
      },
      {
        type: "feature",
        text: "Delegated DNS — use your own nameservers with full delegation support for advanced DNS management.",
      },
      {
        type: "improvement",
        text: "Automatic nameserver validation ensures delegated DNS configurations follow DNS standards before activation.",
      },
      {
        type: "improvement",
        text: "Database architecture expanded with dedicated systems for KYC, certificates, agreements, and delegated DNS.",
      },
    ],
  },
  {
    version: "v2.2.0",
    date: "July 9, 2026",
    changes: [
      {
        type: "feature",
        text: "Uptime monitoring — track every subdomain with real-time checks and public badges.",
      },
      {
        type: "feature",
        text: "Custom domains — bring your own domain, verified with TXT records.",
      },
      {
        type: "feature",
        text: "Subscription plans with Cashfree payments — free tier plus Pro for power users.",
      },
      {
        type: "feature",
        text: "DNS analytics — query volumes, top records, and traffic patterns at a glance.",
      },
      {
        type: "feature",
        text: "Abuse detection system — heuristic and AI-powered scanning to keep the platform clean.",
      },
      {
        type: "feature",
        text: "Admin panel — full oversight with reserved subdomains, reports, and system controls.",
      },
    ],
  },
  {
    version: "v2.1.0",
    date: "July 2, 2026",
    changes: [
      {
        type: "feature",
        text: "CLI — manage your corner of the internet directly from the terminal.",
      },
      {
        type: "feature",
        text: "Live status page with real-time service monitoring.",
      },
      {
        type: "improvement",
        text: "DNS propagation now under 30 seconds for significantly faster updates.",
      },
      {
        type: "fix",
        text: "Improved reliability of rate limiting on bulk DNS operations.",
      },
    ],
  },
  {
    version: "v2.0.0",
    date: "June 15, 2026",
    changes: [
      {
        type: "feature",
        text: "Cloudflare proxy toggle — enable orange-cloud protection for every subdomain.",
      },
      {
        type: "feature",
        text: "API key management with granular permissions for every key.",
      },
      {
        type: "feature",
        text: "Webhooks — receive instant notifications whenever DNS records change.",
      },
      {
        type: "improvement",
        text: "Completely redesigned dashboard with faster, real-time updates.",
      },
    ],
  },
  {
    version: "v1.5.0",
    date: "May 20, 2026",
    changes: [
      {
        type: "feature",
        text: "SRV and CAA record support for advanced DNS configurations.",
      },
      {
        type: "feature",
        text: "Bulk DNS import and export for managing records at scale.",
      },
      {
        type: "improvement",
        text: "Faster search and smarter filtering across the dashboard.",
      },
    ],
  },
  {
    version: "v1.4.0",
    date: "April 10, 2026",
    changes: [
      {
        type: "feature",
        text: "Activity log — complete audit trail for every DNS change.",
      },
      {
        type: "improvement",
        text: "Near-instant subdomain availability checks.",
      },
      {
        type: "fix",
        text: "Improved TXT record validation, including SPF entries.",
      },
    ],
  },
  {
    version: "v1.3.0",
    date: "March 1, 2026",
    changes: [
      {
        type: "feature",
        text: "MX record support for email routing.",
      },
      {
        type: "improvement",
        text: "Faster dashboard loading and smoother user experience.",
      },
      {
        type: "fix",
        text: "More accurate TTL handling for proxied DNS records.",
      },
    ],
  },
  {
    version: "v1.2.0",
    date: "February 5, 2026",
    changes: [
      {
        type: "feature",
        text: "CNAME flattening for cleaner and more reliable DNS.",
      },
      {
        type: "feature",
        text: "Rate limit headers added to every API response.",
      },
      {
        type: "fix",
        text: "Subdomain deletion now safely removes all associated DNS records.",
      },
    ],
  },
];

const typeStyles: Record<string, string> = {
  feature:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  improvement:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  fix: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export default function ChangelogPage() {
  return (
    <>
      <Navbar />

      <main className="pt-16">
        <div className="mx-auto max-w-3xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>

            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              We ship constantly to make your corner of the internet faster,
              more capable, and more delightful. Every feature, improvement,
              and fix is documented here—because transparency matters.
            </p>
          </div>

          <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-neutral-200 dark:before:bg-neutral-800">
            {releases.map((release) => (
              <div key={release.version} className="relative pl-10">
                <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-neutral-300 bg-background dark:border-neutral-600" />

                <div className="mb-1 flex items-baseline gap-3">
                  <h2 className="text-xl font-semibold">{release.version}</h2>
                  <span className="text-sm text-neutral-500">
                    {release.date}
                  </span>
                </div>

                <ul className="mt-3 space-y-2">
                  {release.changes.map((change, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span
                        className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium capitalize ${typeStyles[change.type]}`}
                      >
                        {change.type}
                      </span>

                      <span className="text-neutral-700 dark:text-neutral-300">
                        {change.text}
                      </span>
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