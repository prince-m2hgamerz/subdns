import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const apiDocSections = [
  {
    title: "Authentication",
    content: "All API requests require an API key passed via the `Authorization` header:\n\n```\nAuthorization: Bearer sdns_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n```\n\nKeys are managed from the API Keys section. Each key can be scoped to specific resources (subdomains, DNS, webhooks) with read or write access.",
  },
  {
    title: "Base URL",
    content: "```\nhttps://subdns.m2hio.in\n```",
  },
  {
    title: "Rate Limiting",
    content: "API requests are rate-limited to 60 requests per minute per key. Exceeding this returns a `429 Too Many Requests` response with a `Retry-After` header.",
  },
  {
    title: "Error Codes",
    content: "| Code | Description |\n|------|-------------|\n| 400 | Bad Request — malformed payload |\n| 401 | Unauthorized — invalid or missing API key |\n| 403 | Forbidden — key lacks required scope |\n| 404 | Not Found |\n| 429 | Rate limit exceeded |\n| 500 | Internal server error |",
  },
];

export default function DeveloperApiDocs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Documentation</h1>
        <p className="text-sm text-muted-foreground">Reference for the SubDNS API</p>
      </div>

      {apiDocSections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">{section.content}</pre>
          </CardContent>
        </Card>
      ))}

      <p className="text-xs text-muted-foreground">
        For the full API specification and to try endpoints live, visit the{" "}
        <a href="#" className="text-primary underline underline-offset-4">complete API reference</a>.
      </p>
    </div>
  );
}
