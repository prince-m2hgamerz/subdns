import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Release {
  version: string;
  date: string;
  tag: "stable" | "beta" | "deprecated";
  changes: { type: "feature" | "fix" | "breaking" | "improvement"; text: string }[];
}

const releases: Release[] = [
  {
    version: "v2.1.0",
    date: "June 15, 2026",
    tag: "stable",
    changes: [
      { type: "feature", text: "New DNS-over-HTTPS (DoH) endpoint: POST /api/v1/dns/resolve" },
      { type: "feature", text: "Bulk subdomain operations: create, update, and delete in batches" },
      { type: "improvement", text: "Reduced API latency by 35% with optimized DNS propagation checks" },
      { type: "fix", text: "Webhook HMAC signature now uses SHA-256 consistently" },
    ],
  },
  {
    version: "v2.0.0",
    date: "May 1, 2026",
    tag: "stable",
    changes: [
      { type: "breaking", text: "API version bumped to v1. All /api/v0 endpoints are deprecated" },
      { type: "feature", text: "Subdomain health monitoring with configurable check intervals" },
      { type: "feature", text: "Granular API key scopes (read / write per resource type)" },
      { type: "feature", text: "Custom DNS record types: MX, CAA, SRV, and TLSA" },
      { type: "improvement", text: "Rate limit headers now include remaining and reset timestamps" },
    ],
  },
  {
    version: "v1.12.0",
    date: "March 10, 2026",
    tag: "stable",
    changes: [
      { type: "feature", text: "Webhook event delivery with retry and dead-letter queue" },
      { type: "improvement", text: "Error responses now include request IDs for debugging" },
      { type: "fix", text: "Fixed pagination cursor encoding for large result sets" },
    ],
  },
  {
    version: "v1.11.0",
    date: "January 22, 2026",
    tag: "stable",
    changes: [
      { type: "feature", text: "Activity log API: GET /api/v1/activity with event filtering" },
      { type: "feature", text: "Subdomain ownership verification via TXT record" },
      { type: "improvement", text: "SDK auto-retry with exponential backoff for 429 responses" },
    ],
  },
  {
    version: "v1.10.0-beta",
    date: "December 5, 2025",
    tag: "beta",
    changes: [
      { type: "feature", text: "Edge functions runtime preview (limited beta)" },
      { type: "feature", text: "Custom SSL certificate upload for subdomains" },
    ],
  },
  {
    version: "v1.9.0",
    date: "October 18, 2025",
    tag: "stable",
    changes: [
      { type: "feature", text: "API playground — interactive endpoint tester" },
      { type: "fix", text: "DNS propagation timeout increased from 30s to 60s for slow TLDs" },
      { type: "improvement", text: "OpenAPI spec now available at /api/v1/openapi.json" },
    ],
  },
];

const tagStyles: Record<string, string> = {
  stable: "text-green-600 border-green-600",
  beta: "text-amber-600 border-amber-600",
  deprecated: "text-red-600 border-red-600",
};

const changeStyles: Record<string, string> = {
  feature: "text-blue-600",
  fix: "text-green-600",
  breaking: "text-red-600",
  improvement: "text-neutral-600 dark:text-neutral-400",
};

export default function ChangelogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Changelog</h1>
        <p className="text-muted-foreground">Track API changes, new features fixes, and platform improvements.</p>
      </div>

      <div className="space-y-4">
        {releases.map((release) => (
          <Card key={release.version}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-mono">{release.version}</CardTitle>
                  <Badge variant="outline" className={tagStyles[release.tag]}>{release.tag}</Badge>
                </div>
                <CardDescription>{release.date}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {release.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 shrink-0 font-medium ${changeStyles[change.type]}`}>
                      {change.type === "feature" && "+"}
                      {change.type === "fix" && "✓"}
                      {change.type === "breaking" && "⚠"}
                      {change.type === "improvement" && "→"}
                    </span>
                    <span className={change.type === "breaking" ? "text-red-700 dark:text-red-400" : "text-muted-foreground"}>
                      {change.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Subscribe to the <a href="#" className="text-primary underline underline-offset-4">release RSS feed</a> to get notified of new versions.
      </p>
    </div>
  );
}
