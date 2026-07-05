#!/usr/bin/env node
import { Command } from "commander";
import { setApiKey, clearApiKey } from "./config.js";
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
    .action((key) => {
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
    .action(async (name, opts) => {
    const body = {
        name,
        type: opts.type ?? "CNAME",
        proxied: opts.proxied ?? true,
    };
    if (opts.target)
        body.target = opts.target;
    const data = await post("/api/subdomains", body);
    console.log(chalk.green("✓ Subdomain claimed"));
    console.log(JSON.stringify(data.subdomain, null, 2));
});
program
    .command("list")
    .description("List all your subdomains")
    .action(async () => {
    const data = await get("/api/subdomains");
    if (data.subdomains.length === 0) {
        console.log("No subdomains found");
        return;
    }
    for (const sd of data.subdomains) {
        const fullDomain = sd.fullDomain;
        const target = sd.target ?? "-";
        const status = sd.status;
        const col = status === "ACTIVE" ? chalk.green : chalk.yellow;
        console.log(`${col(fullDomain.padEnd(30))} → ${target}`);
    }
});
program
    .command("info")
    .description("Show details for a subdomain")
    .argument("<name>", "Subdomain name (full domain or just the prefix)")
    .action(async (name) => {
    const data = await get("/api/subdomains");
    const sd = data.subdomains.find((s) => s.name === name || s.fullDomain === name);
    if (!sd) {
        console.error(chalk.red(`Subdomain "${name}" not found`));
        process.exit(1);
    }
    const info = await get(`/api/subdomains/${sd.id}`);
    console.log(JSON.stringify(info.subdomain, null, 2));
});
program
    .command("release")
    .description("Release/delete a subdomain")
    .argument("<name>", "Subdomain name (full domain or just the prefix)")
    .action(async (name) => {
    const data = await get("/api/subdomains");
    const sd = data.subdomains.find((s) => s.name === name || s.fullDomain === name);
    if (!sd) {
        console.error(chalk.red(`Subdomain "${name}" not found`));
        process.exit(1);
    }
    await del(`/api/subdomains/${sd.id}`);
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
    .action(async (name, opts) => {
    const data = await get("/api/subdomains");
    const sd = data.subdomains.find((s) => s.name === name || s.fullDomain === name);
    if (!sd) {
        console.error(chalk.red(`Subdomain "${name}" not found`));
        process.exit(1);
    }
    const body = {
        subdomainId: sd.id,
        type: opts.type.toUpperCase(),
        content: opts.content,
        ttl: parseInt(opts.ttl) || 1,
    };
    if (opts.proxied !== undefined)
        body.proxied = opts.proxied;
    if (opts.priority !== undefined)
        body.priority = opts.priority;
    const result = await post("/api/dns", body);
    console.log(chalk.green("✓ DNS record added"));
    console.log(JSON.stringify(result.record, null, 2));
});
dns
    .command("rm")
    .description("Remove a DNS record")
    .argument("<id>", "DNS record ID")
    .action(async (id) => {
    await del(`/api/dns/${id}`);
    console.log(chalk.green("✓ DNS record removed"));
});
program
    .command("logs")
    .description("View recent activity logs")
    .option("--limit <n>", "Number of logs (default: 20)", "20")
    .action(async (opts) => {
    const data = await get(`/api/activity?limit=${opts.limit}`);
    if (data.activities.length === 0) {
        console.log("No activity found");
        return;
    }
    for (const a of data.activities) {
        const time = new Date(a.createdAt).toLocaleString();
        const desc = a.description;
        console.log(`${chalk.gray(time)}  ${desc}`);
    }
});
program.parse();
//# sourceMappingURL=index.js.map