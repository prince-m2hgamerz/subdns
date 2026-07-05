export interface BlogPost {
  title: string
  excerpt: string
  content: string
  date: string
  slug: string
  tags: string[]
  author: string
}

export const posts: BlogPost[] = [
  {
    title: "Introducing SubDNS: Free Subdomains for Every Developer",
    excerpt: "Today we're launching SubDNS — a free subdomain service that gives every developer a corner of the internet to call their own.",
    content: `Every developer needs a place to experiment. A staging environment, a side project, a portfolio, or just a URL that doesn't look like localhost:3000.

That's why we built SubDNS.

## What is SubDNS?

SubDNS gives you a free subdomain on \`m2hio.in\` — instantly, with no credit card, no phone call, no sales demo. You get full DNS control, Cloudflare proxying, automatic SSL, and an API to manage it all programmatically.

## Why free?

We believe DNS should be a utility, not a product. The domain industry has spent decades making something simple feel complicated. SubDNS strips that away:

- **Free subdomains** — \`your-project.m2hio.in\` in seconds
- **Full DNS control** — A, AAAA, CNAME, TXT, MX, NS records
- **Cloudflare proxy** — DDoS protection, CDN, auto SSL
- **CLI & API** — Manage from your terminal or CI/CD pipeline
- **No lock-in** — Bring your own domain anytime

## What can you build?

- A staging environment that your team can actually visit
- A personal portfolio that loads in milliseconds
- A dynamic DNS endpoint for your homelab
- API endpoints with custom subdomain routing
- Preview deployments for every PR

## Getting started

\`\`\`bash
npx subdns create my-project
# ✓ Subdomain created: my-project.m2hio.in
# ✓ SSL provisioned
# ✓ Cloudflare proxy enabled
\`\`\`

Try it today. It's free, it's fast, and it's yours.`,
    date: "2026-06-15",
    slug: "introducing-subdns",
    tags: ["Product", "Launch"],
    author: "SubDNS Team",
  },
  {
    title: "Managing DNS Records with the SubDNS CLI",
    excerpt: "Our CLI makes DNS management as fast as your terminal. Learn how to create, update, and delete records without leaving your command line.",
    content: `The command line is the fastest interface for DNS management. Here's how to use the SubDNS CLI to manage your subdomains.

## Installation

\`\`\`bash
npx subdns login
\`\`\`

This authenticates you and sets up the CLI in one command. No manual API key management needed.

## Creating records

\`\`\`bash
# Point your subdomain to a server
subdns dns add my-project --type A --value 192.0.2.1

# Set up a CNAME for your custom domain
subdns dns add my-project --type CNAME --value yourdomain.com

# Add MX records for email
subdns dns add my-project --type MX --value mail.yourdomain.com --priority 10
\`\`\`

## Cloudflare proxy toggle

Every record can be proxied through Cloudflare's edge:

\`\`\`bash
subdns dns update my-project --record-id abc123 --proxied true
\`\`\`

With proxy enabled, your traffic gets DDoS protection, HTTP/2, and automatic SSL — all included.

## Bulk operations

\`\`\`bash
# Import from a JSON file
subdns dns import my-project --file records.json

# Export all records
subdns dns export my-project --format json > backup.json

# Delete multiple records
subdns dns delete my-project --ids abc123 def456
\`\`\`

The CLI is open source and extensible. Contributions welcome.`,
    date: "2026-06-10",
    slug: "cli-dns-management",
    tags: ["CLI", "Guide"],
    author: "SubDNS Team",
  },
  {
    title: "How We Use Cloudflare's Edge to Make Your Subdomains Fast",
    excerpt: "Every SubDNS subdomain is proxied through Cloudflare's global network. Here's a deep dive into the architecture that keeps your sites loading in milliseconds.",
    content: `Speed is not a feature — it's a requirement. Every SubDNS subdomain is served through Cloudflare's global network, spanning 330+ cities in over 120 countries.

## How it works

When you create a subdomain with Cloudflare proxy enabled, traffic flows through this path:

\`\`\`
Visitor → Cloudflare Edge (nearest PoP) → Your Origin → Cloudflare Edge → Visitor
\`\`\`

## Benefits you get automatically

**Global CDN**: Static assets are cached at the edge. Your visitors never hit your origin for cached content.

**Auto SSL**: Let's Encrypt certificates are provisioned and renewed automatically. No manual HTTPS setup.

**DDoS protection**: Cloudflare's network absorbs attacks before they reach your server.

**HTTP/2 & HTTP/3**: Modern protocols enabled automatically for faster load times.

## Architecture deep dive

Each subdomain record in SubDNS is stored in Cloudflare as a proxied DNS record. When a request arrives:

1. Cloudflare's Anycast network routes it to the nearest PoP
2. If cached, the response is served directly from the edge
3. If uncached, Cloudflare fetches from your origin over a persistent connection
4. The response is cached and served to the visitor

## Real-world performance

We've measured a 60-80% reduction in TTFB (Time to First Byte) for proxied subdomains compared to direct DNS resolution. For global audiences, the difference is even more dramatic.

The edge isn't just fast — it's resilient. Your site stays up even if your origin has brief outages.`,
    date: "2026-06-05",
    slug: "cloudflare-edge-architecture",
    tags: ["Engineering", "Performance"],
    author: "SubDNS Team",
  },
  {
    title: "Automating Subdomain Deployments with Our REST API",
    excerpt: "From CI/CD pipelines to dynamic DNS, our REST API lets you manage subdomains programmatically. Here are the patterns we recommend.",
    content: `Automation is the difference between a prototype and a production system. The SubDNS REST API lets you manage every aspect of your subdomains without a browser.

## Authentication

All API requests require an API key. Generate one from your dashboard:

\`\`\`bash
# Set your API key
export SUBDNS_API_KEY=sk_your_key_here
\`\`\`

## Core endpoints

\`\`\`bash
# Create a subdomain
curl -X POST https://api.subdns.m2hio.in/subdomains \\
  -H "Authorization: Bearer $SUBDNS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my-project", "proxied": true}'

# Add a DNS record
curl -X POST https://api.subdns.m2hio.in/dns \\
  -H "Authorization: Bearer $SUBDNS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "subdomain": "my-project",
    "type": "A",
    "name": "@",
    "value": "192.0.2.1"
  }'
\`\`\`

## CI/CD integration

Preview deployments are one API call away:

\`\`\`yaml
# .github/workflows/preview.yml
on: pull_request
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          curl -X POST https://api.subdns.m2hio.in/subdomains \\
            -H "Authorization: Bearer $" + "{{ secrets.SUBDNS_API_KEY }}" \\
            -d '{"name": "pr-$" + "{{ github.event.number }}"}'
\`\`\`

Rate limits: 1000 requests per hour for free tier. Enough for most CI/CD workflows.`,
    date: "2026-05-28",
    slug: "api-automation-patterns",
    tags: ["API", "DevOps"],
    author: "SubDNS Team",
  },
  {
    title: "Security Best Practices for Your Subdomain",
    excerpt: "Your corner of the internet should be secure. We cover SSL/TLS, DNSSEC, Cloudflare proxy settings, and other security features available on SubDNS.",
    content: `Security is not optional — even for side projects. Here's how to lock down your SubDNS subdomain.

## 1. Enable Cloudflare proxy

Always enable Cloudflare proxy for your DNS records. This hides your origin IP address and provides DDoS protection:

\`\`\`bash
subdns dns update my-project --record-id abc123 --proxied true
\`\`\`

## 2. Use SSL/TLS

SubDNS automatically provisions SSL certificates for every subdomain. To enforce HTTPS, set your Cloudflare SSL/TLS mode to **Full (strict)**.

## 3. Enable DNSSEC

DNSSEC protects against DNS spoofing. Enable it in your SubDNS dashboard — it takes effect within minutes.

## 4. Restrict API keys

Generate separate API keys for each environment. Use the minimal permissions needed:

- Read-only keys for monitoring
- Subdomain-scoped keys for CI/CD
- Admin keys only for manual operations

## 5. Monitor and audit

The SubDNS dashboard shows every DNS change with timestamps and the user or API key that made it. Review your audit log weekly.

## Quick checklist

- [x] Cloudflare proxy enabled
- [x] SSL/TLS set to Full (strict)
- [x] DNSSEC enabled
- [x] API keys scoped per environment
- [x] Audit log reviewed

Security is a practice, not a setup. These habits keep your corner of the internet safe.`,
    date: "2026-05-20",
    slug: "subdomain-security-best-practices",
    tags: ["Security", "Guide"],
    author: "SubDNS Team",
  },
]

export const siteUrl = "https://subdns.m2hio.in"
