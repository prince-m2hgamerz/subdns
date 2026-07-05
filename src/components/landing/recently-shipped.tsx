import Link from "next/link";
import { ArrowRight } from "lucide-react";

const items = [
  { date: "2025-06-20", text: "Wildcard SSL certificates for all subdomains" },
  { date: "2025-06-15", text: "New CLI commands: `subdns dns export` and `import`" },
  { date: "2025-06-10", text: "CLI login via OAuth tokens" },
  { date: "2025-06-05", text: "API v2 with bulk DNS operations" },
  { date: "2025-06-01", text: "Public dashboard with activity log" },
];

export function RecentlyShipped() {
  return (
    <section className="section-pad border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recently shipped</h2>
            <Link
              href="/changelog"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.date}
                className="glass glass-hover flex items-center gap-4 p-4"
              >
                <time className="w-20 shrink-0 font-mono text-xs text-[#888888]">
                  {item.date}
                </time>
                <span className="text-sm text-[#FFFFFF]">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
