#!/usr/bin/env node

import { Command } from "commander";
import { getApiKey, setApiKey, clearApiKey, getBaseUrl } from "./config.js";
import { get, post, del } from "./api.js";
import chalk from "chalk";

const program = new Command();

program
  .name("subdns")
  .description("Claim your corner of the internet — SubDNS CLI")
  .version("0.1.0");

program
  .command("login")
  .description("Authenticate with an API key")
  .argument("<key>", "API key (create one at the dashboard)")
  .action((key: string) => {
    setApiKey(key);
    console.log(chalk.green("✓ API key saved"));
  });

program
  .command("logout")
  .description("Remove stored API key")
  .action(() => {
    clearApiKey();
    console.log(chalk.green("✓ Logged out"));
  });

program
  .command("claim")
  .description("Claim a subdomain")
  .argument("<name>", "Subdomain name (without the root domain)")
  .option("-t, --target <url>", "Target URL or IP")
  .option("--type <type>", "Record type: CNAME, A, AAAA (default: CNAME)")
  .option("-p, --proxied", "Proxy through Cloudflare", true)
  .action(async (name: string, opts: { target?: string; type?: string; proxied?: boolean }) => {
    const body: Record<string, unknown> = {
      name,
      type: opts.type ?? "CNAME",
      proxied: opts.proxied ?? true,
    };
    if (opts.target) body.target = opts.target;
    const data = await post<{ subdomain: Record<string, unknown> }>("/api/subdomains", body);
    console.log(chalk.green("✓ Subdomain claimed"));
    console.log(JSON.stringify(data.subdomain, null, 2));
  });

program
  .command("list")
  .description("List all your subdomains")
  .action(async () => {
    const data = await get<{ subdomains: Record<string, unknown>[] }>("/api/subdomains");
    if (data.subdomains.length === 0) {
      console.log("No subdomains found");
      return;
    }
    for (const sd of data.subdomains) {
      const fullDomain = sd.fullDomain as string;
      const target = (sd.target as string) ?? "-";
      const status = sd.status as string;
      const col = status === "ACTIVE" ? chalk.green : chalk.yellow;
      console.log(`${col(fullDomain.padEnd(30))} → ${target}`);
    }
  });

program
  .command("info")
  .description("Show details for a subdomain")
  .argument("<name>", "Subdomain name (full domain or just the prefix)")
  .action(async (name: string) => {
    const data = await get<{ subdomains: Record<string, unknown>[] }>("/api/subdomains");
    const sd = data.subdomains.find(
      (s: Record<string, unknown>) =>
        (s.name as string) === name || (s.fullDomain as string) === name
    );
    if (!sd) {
      console.error(chalk.red(`Subdomain "${name}" not found`));
      process.exit(1);
    }
    const info = await get<{ subdomain: Record<string, unknown> }>(`/api/subdomains/${sd.id}`);
    console.log(JSON.stringify(info.subdomain, null, 2));
  });

program
  .command("release")
  .description("Release/delete a subdomain")
  .argument("<name>", "Subdomain name (full domain or just the prefix)")
  .action(async (name: string) => {
    const data = await get<{ subdomains: Record<string, unknown>[] }>("/api/subdomains");
    const sd = data.subdomains.find(
      (s: Record<string, unknown>) =>
        (s.name as string) === name || (s.fullDomain as string) === name
    );
    if (!sd) {
      console.error(chalk.red(`Subdomain "${name}" not found`));
      process.exit(1);
    }
    await del<{ success: boolean }>(`/api/subdomains/${sd.id}`);
    console.log(chalk.green(`✓ Released ${sd.fullDomain}`));
  });

const dns = program
  .command("dns")
  .description("Manage DNS records");

dns
  .command("add")
  .description("Add a DNS record to a subdomain")
  .argument("<name>", "Subdomain name")
  .requiredOption("--type <type>", "Record type: A, AAAA, CNAME, TXT, MX, SRV, CAA")
  .requiredOption("--content <value>", "Record value")
  .option("--ttl <ttl>", "TTL in seconds (default: 1 = auto)", "1")
  .option("--proxied", "Proxy through Cloudflare")
  .option("--priority <priority>", "Priority (for MX/SRV)", parseInt)
  .action(async (name: string, opts: { type: string; content: string; ttl: string; proxied?: boolean; priority?: number }) => {
    const data = await get<{ subdomains: Record<string, unknown>[] }>("/api/subdomains");
    const sd = data.subdomains.find(
      (s: Record<string, unknown>) =>
        (s.name as string) === name || (s.fullDomain as string) === name
    );
    if (!sd) {
      console.error(chalk.red(`Subdomain "${name}" not found`));
      process.exit(1);
    }
    const body: Record<string, unknown> = {
      subdomainId: sd.id,
      type: opts.type.toUpperCase(),
      content: opts.content,
      ttl: parseInt(opts.ttl) || 1,
    };
    if (opts.proxied !== undefined) body.proxied = opts.proxied;
    if (opts.priority !== undefined) body.priority = opts.priority;
    const result = await post<{ record: Record<string, unknown> }>("/api/dns", body);
    console.log(chalk.green("✓ DNS record added"));
    console.log(JSON.stringify(result.record, null, 2));
  });

dns
  .command("rm")
  .description("Remove a DNS record")
  .argument("<id>", "DNS record ID")
  .action(async (id: string) => {
    await del<{ success: boolean }>(`/api/dns/${id}`);
    console.log(chalk.green("✓ DNS record removed"));
  });

program
  .command("logs")
  .description("View recent activity logs")
  .option("--limit <n>", "Number of logs (default: 20)", "20")
  .action(async (opts: { limit: string }) => {
    const data = await get<{ activities: Record<string, unknown>[] }>(
      `/api/activity?limit=${opts.limit}`
    );
    if (data.activities.length === 0) {
      console.log("No activity found");
      return;
    }
    for (const a of data.activities) {
      const time = new Date(a.createdAt as string).toLocaleString();
      const desc = a.description as string;
      console.log(`${chalk.gray(time)}  ${desc}`);
    }
  });

program.parse();
