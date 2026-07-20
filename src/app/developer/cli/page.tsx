import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cliCommands = [
  { cmd: "subdns login", desc: "Authenticate with your API key" },
  { cmd: "subdns subdomains list", desc: "List all your subdomains" },
  { cmd: "subdns subdomains create <name>", desc: "Create a new subdomain" },
  { cmd: "subdns dns list <subdomain>", desc: "List DNS records for a subdomain" },
  { cmd: "subdns dns add <subdomain> --type A --value 1.2.3.4", desc: "Add a DNS record" },
  { cmd: "subdns webhooks list", desc: "List webhook endpoints" },
  { cmd: "subdns webhooks test <id>", desc: "Test a webhook endpoint" },
  { cmd: "subdns logs", desc: "View recent activity logs" },
];

export default function DeveloperCli() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CLI Reference</h1>
        <p className="text-sm text-muted-foreground">Command-line tool for SubDNS</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Installation</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-muted p-4 text-sm font-mono">npm install -g @subdns/cli</pre>
          <p className="mt-2 text-xs text-muted-foreground">Requires Node.js 18+.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-muted p-4 text-sm font-mono">subdns login</pre>
          <p className="mt-2 text-xs text-muted-foreground">
            You will be prompted to enter your API key. The key is stored securely in your system keychain.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cliCommands.map((c) => (
              <div key={c.cmd} className="flex items-start gap-4">
                <code className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs font-mono">
                  {c.cmd}
                </code>
                <span className="text-xs text-muted-foreground">{c.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
