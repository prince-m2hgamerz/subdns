#!/usr/bin/env node
import { Command } from "commander";
import { getApiKey, setApiKey, clearApiKey, getBaseUrl, setBaseUrl, getAllConfig } from "./config.js";
import { get, post, del, ApiError } from "./api.js";
import chalk from "chalk";
const program = new Command();
function requireAuth() {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error(chalk.red("Error: Not logged in"));
        console.error();
        console.error(`  Run: subdns login <API_KEY>`);
        console.error(`  Get your API key from https://subdns.m2hio.in/dashboard/api-keys`);
        process.exit(1);
    }
    return apiKey;
}
function exitWithError(msg, suggestion) {
    console.error(chalk.red(`Error: ${msg}`));
    if (suggestion) {
        console.error();
        console.error(`  Run: ${suggestion}`);
    }
    process.exit(1);
}
function formatTime(iso) {
    return new Date(iso).toLocaleString();
}
function findSubdomain(name, subdomains) {
    return subdomains.find((s) => s.name === name || s.fullDomain === name);
}
const HELP_FOOTER = `
Examples:
  subdns login sk_abc123
  subdns claim my-site -t myapp.vercel.app
  subdns list
  subdns info my-site
  subdns dns add my-site --type A --content 1.2.3.4
  subdns logs

For more details, visit https://subdns.m2hio.in`;
program
    .name("subdns")
    .description("Manage subdomains on SubDNS")
    .version("0.2.0")
    .addHelpText("after", HELP_FOOTER);
// ── login ──────────────────────────────────────────────
program
    .command("login")
    .description("Authenticate with an API key")
    .argument("<key>", "API key (create one at the dashboard)")
    .addHelpText("after", `
Example:
  subdns login sk_live_abc123

Get your key at https://subdns.m2hio.in/dashboard/api-keys`)
    .action((key) => {
    if (!key.startsWith("sk_")) {
        console.warn(chalk.yellow("Warning: API key looks unusual — expected format: sk_..."));
    }
    setApiKey(key);
    console.log(chalk.green("API key saved"));
    console.log(`  Run: subdns list`);
});
// ── logout ─────────────────────────────────────────────
program
    .command("logout")
    .description("Remove your stored API key")
    .action(() => {
    if (!getApiKey()) {
        console.log(chalk.yellow("Already logged out."));
        return;
    }
    clearApiKey();
    console.log(chalk.green("Logged out"));
});
// ── status ─────────────────────────────────────────────
program
    .command("status")
    .description("Show auth status and API connectivity")
    .addHelpText("after", `
Example:
  subdns status`)
    .action(async () => {
    const apiKey = getApiKey();
    const baseUrl = getBaseUrl();
    console.log(`subdns CLI ${chalk.dim("v0.2.0")}`);
    console.log();
    console.log(`  API URL:  ${baseUrl}`);
    console.log(`  Auth:     ${apiKey ? chalk.green("OK") : chalk.red("missing")}`);
    if (apiKey) {
        process.stdout.write(`  API:      `);
        try {
            const data = await get("/api/subdomains", 5000);
            console.log(chalk.green("OK"));
            console.log(`  Domains:  ${data.subdomains.length}`);
        }
        catch (err) {
            console.log(chalk.red("unreachable"));
            const msg = err instanceof ApiError ? err.message : String(err);
            console.log(`  Error:    ${chalk.red(msg)}`);
            console.log();
            console.log(`  Check SUBDNS_API_URL or your network connection`);
        }
    }
});
// ── config ─────────────────────────────────────────────
const configCmd = program
    .command("config")
    .description("Manage persistent configuration")
    .addHelpText("after", `
Examples:
  subdns config get
  subdns config set baseUrl http://localhost:3000

Config values are stored in your OS keychain / user config directory.`);
configCmd
    .command("get")
    .description("Show all stored configuration (secrets hidden)")
    .argument("[key]", "Specific config key")
    .action((key) => {
    const all = getAllConfig();
    if (Object.keys(all).length === 0) {
        console.log(chalk.yellow("No configuration stored."));
        return;
    }
    if (key) {
        const val = key === "apiKey" ? chalk.dim("••••••••") : all[key];
        console.log(String(val ?? ""));
        return;
    }
    for (const [k, v] of Object.entries(all)) {
        const display = k === "apiKey" ? chalk.dim("••••••••") : String(v);
        console.log(`  ${k}: ${display}`);
    }
});
configCmd
    .command("set")
    .description("Set a config value")
    .argument("<key>", "Config key (apiKey or baseUrl)")
    .argument("<value>", "Config value")
    .addHelpText("after", `
Valid keys:
  apiKey   API authentication key
  baseUrl  Base URL of the SubDNS API (default: https://subdns.m2hio.in)`)
    .action((key, value) => {
    switch (key) {
        case "apiKey":
            setApiKey(value);
            console.log(chalk.green("API key saved"));
            break;
        case "baseUrl":
            setBaseUrl(value);
            console.log(chalk.green(`Base URL set to ${value}`));
            break;
        default:
            exitWithError(`Unknown config key "${key}"`, "subdns config get");
    }
});
// ── claim ──────────────────────────────────────────────
program
    .command("claim")
    .description("Claim a new subdomain")
    .argument("<name>", "Subdomain name (prefix only, e.g. my-project)")
    .requiredOption("-t, --target <url>", "Target URL or IP address")
    .option("--type <type>", "Record type: CNAME (default), A, AAAA", "CNAME")
    .option("-p, --proxied", "Proxy through Cloudflare (default)")
    .option("--no-proxied", "DNS-only mode (no Cloudflare proxy)")
    .addHelpText("after", `
Examples:
  subdns claim my-app -t myapp.vercel.app
  subdns claim blog -t 192.0.2.1 --type A --no-proxied
  subdns claim api -t api.example.com --type CNAME`)
    .action(async (name, opts) => {
    requireAuth();
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(name)) {
        exitWithError(`Invalid name "${name}"`, "Use only lowercase letters, numbers, and hyphens.");
    }
    const body = {
        name,
        type: opts.type.toUpperCase(),
        target: opts.target,
        proxied: opts.proxied,
    };
    try {
        const data = await post("/api/subdomains", body);
        const sd = data.subdomain;
        console.log(chalk.green(`${sd.fullDomain} claimed`));
        console.log(`  Target: ${sd.target}`);
        console.log(`  Type:   ${sd.type}`);
        console.log(`  Proxy:  ${sd.proxied ? "yes" : "no"}`);
    }
    catch (err) {
        const msg = err instanceof ApiError ? err.message : String(err);
        exitWithError(msg, "subdns list");
    }
});
// ── list ───────────────────────────────────────────────
program
    .command("list")
    .alias("ls")
    .description("List all your subdomains")
    .addHelpText("after", `
Examples:
  subdns list
  subdns ls`)
    .action(async () => {
    requireAuth();
    try {
        const data = await get("/api/subdomains");
        if (data.subdomains.length === 0) {
            console.log(chalk.yellow("No subdomains found."));
            console.log(`  Claim one: subdns claim <name> -t <target>`);
            return;
        }
        const rows = data.subdomains.map((sd) => ({
            domain: String(sd.fullDomain ?? sd.name ?? "?"),
            target: String(sd.target ?? "-"),
            type: String(sd.type ?? "-"),
            status: String(sd.status ?? "UNKNOWN"),
            proxied: Boolean(sd.proxied),
        }));
        const c1 = Math.max(...rows.map((r) => r.domain.length), 6) + 2;
        const c2 = Math.max(...rows.map((r) => r.target.length), 6) + 2;
        const c3 = Math.max(...rows.map((r) => r.type.length), 4) + 2;
        const hdr = (s, w) => chalk.bold(s.padEnd(w));
        const sep = chalk.dim("─".repeat(c1 + c2 + c3 + 15));
        console.log(`  ${hdr("Domain", c1)}${hdr("Target", c2)}${hdr("Type", c3)} Proxy  Status`);
        console.log(`  ${sep}`);
        for (const r of rows) {
            const statusColor = r.status === "ACTIVE" ? chalk.green : chalk.yellow;
            const proxyMark = r.proxied ? "yes" : "no";
            console.log(`  ${statusColor(r.domain.padEnd(c1))}` +
                `${chalk.white(r.target.padEnd(c2))}` +
                `${r.type.padEnd(c3)}` +
                ` ${proxyMark.padEnd(6)}` +
                `${statusColor(r.status)}`);
        }
    }
    catch (err) {
        const msg = err instanceof ApiError ? err.message : String(err);
        exitWithError(msg, "subdns status");
    }
});
// ── info ───────────────────────────────────────────────
program
    .command("info")
    .description("Show full details for a subdomain")
    .argument("<name>", "Subdomain name or full domain")
    .addHelpText("after", `
Examples:
  subdns info my-app
  subdns info my-app.m2hio.in`)
    .action(async (name) => {
    requireAuth();
    try {
        const all = await get("/api/subdomains");
        const sd = findSubdomain(name, all.subdomains);
        if (!sd) {
            exitWithError(`Subdomain "${name}" not found`, "subdns list");
        }
        const data = await get(`/api/subdomains/${sd.id}`);
        const sub = data.subdomain;
        console.log();
        console.log(`  ${chalk.bold(sub.fullDomain)}`);
        console.log(`  ${chalk.dim("─".repeat(Math.min(String(sub.fullDomain ?? "").length, 48)))}`);
        for (const [key, value] of Object.entries(sub)) {
            if (key === "fullDomain" || key === "id")
                continue;
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
            const display = value == null ? chalk.dim("-") : String(value);
            console.log(`  ${label}:${" ".repeat(Math.max(1, 18 - label.length))} ${display}`);
        }
        const records = sub.dnsRecords;
        if (records && records.length > 0) {
            console.log();
            console.log(`  DNS Records:`);
            const mc = Math.max(...records.map((r) => r.type.length), 4) + 2;
            for (const rec of records) {
                const ttl = rec.ttl != null && rec.ttl !== 1 ? `TTL: ${rec.ttl}` : "TTL: auto";
                console.log(`    ${rec.type.padEnd(mc)}${rec.content}  (${ttl})`);
            }
        }
        console.log();
    }
    catch (err) {
        const msg = err instanceof ApiError ? err.message : String(err);
        exitWithError(msg);
    }
});
// ── release ────────────────────────────────────────────
program
    .command("release")
    .description("Release (delete) a subdomain")
    .argument("<name>", "Subdomain name or full domain")
    .addHelpText("after", `
Example:
  subdns release my-old-app

This permanently deletes the subdomain and all its DNS records.`)
    .action(async (name) => {
    requireAuth();
    try {
        const all = await get("/api/subdomains");
        const sd = findSubdomain(name, all.subdomains);
        if (!sd) {
            exitWithError(`Subdomain "${name}" not found`, "subdns list");
        }
        const domain = String(sd.fullDomain ?? sd.name ?? name);
        console.log(chalk.dim(`Releasing ${domain}...`));
        await del(`/api/subdomains/${sd.id}`);
        console.log(chalk.green(`${domain} released`));
    }
    catch (err) {
        const msg = err instanceof ApiError ? err.message : String(err);
        exitWithError(msg);
    }
});
// ── dns ────────────────────────────────────────────────
const VALID_DNS_TYPES = ["A", "AAAA", "CNAME", "TXT", "MX", "SRV", "CAA", "NS", "PTR"];
const dns = program
    .command("dns")
    .description("Manage DNS records for your subdomains")
    .addHelpText("after", `
Examples:
  subdns dns add my-app --type A --content 1.2.3.4
  subdns dns add my-app --type CNAME --content myapp.vercel.app -p
  subdns dns rm <record-id>

Valid types: ${VALID_DNS_TYPES.join(", ")}`);
dns
    .command("add")
    .description("Add a DNS record to a subdomain")
    .argument("<name>", "Subdomain name")
    .requiredOption("--type <type>", `Record type (${VALID_DNS_TYPES.join(", ")})`)
    .requiredOption("--content <value>", "Record value (IP, hostname, text, etc.)")
    .option("--ttl <ttl>", "TTL in seconds (1 = auto)", "1")
    .option("-p, --proxied", "Proxy through Cloudflare")
    .option("--priority <priority>", "Priority (for MX / SRV)", parseInt)
    .addHelpText("after", `
Example:
  subdns dns add my-site --type A --content 76.76.21.21 -p`)
    .action(async (name, opts) => {
    requireAuth();
    try {
        const all = await get("/api/subdomains");
        const sd = findSubdomain(name, all.subdomains);
        if (!sd) {
            exitWithError(`Subdomain "${name}" not found`, "subdns list");
        }
        const type = opts.type.toUpperCase();
        if (!VALID_DNS_TYPES.includes(type)) {
            exitWithError(`Invalid DNS type "${type}"`, `Valid types: ${VALID_DNS_TYPES.join(", ")}`);
        }
        const body = {
            subdomainId: sd.id,
            type,
            content: opts.content,
            ttl: Math.max(1, parseInt(opts.ttl) || 1),
        };
        if (opts.proxied !== undefined)
            body.proxied = opts.proxied;
        if (opts.priority !== undefined)
            body.priority = opts.priority;
        const domain = String(sd.fullDomain ?? sd.name ?? name);
        const result = await post("/api/dns", body);
        const rec = result.record;
        console.log(chalk.green(`${type} record added to ${domain}`));
        console.log(`  Content: ${rec.content ?? opts.content}`);
        console.log(`  TTL:     ${body.ttl === 1 ? "auto" : String(body.ttl)}`);
        if (opts.proxied !== undefined) {
            console.log(`  Proxy:   ${opts.proxied ? "yes" : "no"}`);
        }
    }
    catch (err) {
        const msg = err instanceof ApiError ? err.message : String(err);
        exitWithError(msg);
    }
});
dns
    .command("rm")
    .description("Remove a DNS record by its ID")
    .argument("<id>", "DNS record ID (from subdns info)")
    .addHelpText("after", `
Examples:
  subdns dns rm <record-id>
  subdns info my-site`)
    .action(async (id) => {
    requireAuth();
    try {
        await del(`/api/dns/${id}`);
        console.log(chalk.green("DNS record removed"));
    }
    catch (err) {
        const msg = err instanceof ApiError ? err.message : String(err);
        exitWithError(msg, "subdns info <name>");
    }
});
// ── logs ───────────────────────────────────────────────
program
    .command("logs")
    .description("View recent activity logs")
    .option("--limit <n>", "Number of logs to show (max 100)", "20")
    .addHelpText("after", `
Examples:
  subdns logs
  subdns logs --limit 50`)
    .action(async (opts) => {
    requireAuth();
    try {
        const data = await get(`/api/activity?limit=${Math.min(Math.max(1, parseInt(opts.limit) || 20), 100)}`);
        if (data.activities.length === 0) {
            console.log(chalk.yellow("No activity found."));
            return;
        }
        const rows = data.activities.map((a) => ({
            time: formatTime((a.createdAt ?? a.created_at)),
            event: String(a.event ?? a.type ?? "-"),
            description: String(typeof a.description === "string"
                ? (() => { try {
                    const p = JSON.parse(a.description);
                    return p.description ?? p.name ?? a.description;
                }
                catch {
                    return a.description;
                } })()
                : a.description ?? ""),
        }));
        const maxEvent = Math.max(...rows.map((r) => r.event.length), 4) + 2;
        for (const r of rows) {
            console.log(`  ${chalk.dim(r.time)} ${r.event.padEnd(maxEvent)}${r.description}`);
        }
    }
    catch (err) {
        const msg = err instanceof ApiError ? err.message : String(err);
        exitWithError(msg);
    }
});
// ── Parse ──────────────────────────────────────────────
program.parse();
//# sourceMappingURL=index.js.map