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
curl -X POST https://subdns.m2hio.in/subdomains \\
  -H "Authorization: Bearer $SUBDNS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my-project", "proxied": true}'

# Add a DNS record
curl -X POST https://subdns.m2hio.in/dns \\
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
          curl -X POST https://subdns.m2hio.in/subdomains \\
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
  {
    title: "DNS Record Types Explained: A, AAAA, CNAME, MX, TXT, and More",
    excerpt: "DNS records are the building blocks of the internet. Learn what each record type does and when to use them with your SubDNS subdomain.",
    content: `If you have ever managed a website or a web application, you have interacted with DNS records. They are the fundamental building blocks that tell the internet how to route traffic to your domain. Understanding them is essential for any developer.

## What is a DNS record?

A DNS record is a set of instructions stored on a nameserver that tells the internet where to find your service. When someone types your subdomain into their browser, their computer queries the global DNS system, follows the chain of records, and lands on your server.

## A records

The A record is the most fundamental DNS record type. It maps a domain name to an IPv4 address. When you point your subdomain to a server, this is the record you will use most often.

\`\`\`
example.m2hio.in  A  192.0.2.1
\`\`\`

Use an A record when you have a server with a static IPv4 address. This includes VPS instances on providers like DigitalOcean, Linode, or AWS EC2.

## AAAA records

AAAA records are the IPv6 equivalent of A records. They map a domain name to an IPv6 address.

\`\`\`
example.m2hio.in  AAAA  2001:db8::1
\`\`\`

If your hosting provider supports IPv6, adding an AAAA record alongside your A record ensures visitors on IPv6 networks get the best possible performance. Many modern hosting platforms assign IPv6 addresses by default.

## CNAME records

CNAME records map a domain name to another domain name. Instead of pointing to an IP address, they point to another domain, and the DNS system resolves that target.

\`\`\`
docs.m2hio.in  CNAME  your-username.github.io
\`\`\`

CNAME records are ideal for services that provide you with a target domain, such as GitHub Pages, Netlify, Vercel, or Render. If the service changes its IP addresses, your CNAME continues to work because it follows the target domain.

One important limitation: you cannot use a CNAME record at the root of a domain (the apex). This is a DNS specification constraint. For root domains, you typically use A or AAAA records, or a CNAME flattening service.

## MX records

MX records specify the mail servers responsible for receiving email on behalf of your domain. Each MX record has a priority value. Lower values are preferred.

\`\`\`
m2hio.in  MX  10  mail.your-email-provider.com
m2hio.in  MX  20  backup.your-email-provider.com
\`\`\`

If you want to receive email at your custom domain, you configure MX records to point to your email provider. Google Workspace, Microsoft 365, and Zoho Mail all require MX records for domain verification and email routing.

## TXT records

TXT records store arbitrary text data associated with your domain. They are used for a wide variety of verification and security purposes:

\`\`\`
m2hio.in  TXT  "v=spf1 include:_spf.google.com ~all"
m2hio.in  TXT  "google-site-verification=abc123"
\`\`\`

Common uses for TXT records include SPF email authentication, DKIM public keys, DMARC policies, domain verification for Google Search Console, and custom verification tokens for various SaaS platforms.

## NS records

NS records delegate a subdomain to a different set of nameservers. This is useful when you want a subdomain to be managed by a different DNS provider:

\`\`\`
app.m2hio.in  NS  ns1.dns-provider.com
app.m2hio.in  NS  ns2.dns-provider.com
\`\`\`

## SRV records

SRV records specify the location of specific services, including the hostname and port number. They are commonly used by messaging protocols like SIP and XMPP:

\`\`\`
_sip._tcp.m2hio.in  SRV  10 5 5060 sip-server.example.com
\`\`\`

## CAA records

CAA records specify which certificate authorities are allowed to issue SSL certificates for your domain. This is a security measure that prevents unauthorized certificate issuance:

\`\`\`
m2hio.in  CAA  0  issue  "letsencrypt.org"
\`\`\`

## Managing records on SubDNS

SubDNS supports all major record types through our CLI and web dashboard. To add a record:

\`\`\`bash
subdns dns add my-project --type A --value 203.0.113.1
\`\`\`

You can also add multiple record types for the same subdomain. A common setup might include an A record for your web server, an MX record for email, and a TXT record for SPF authentication. All of these coexist on the same subdomain.

Understanding these record types gives you full control over how your subdomain behaves. Each record type serves a specific purpose, and choosing the right one ensures your services are reachable, secure, and performant.`,
    date: "2026-07-01",
    slug: "dns-record-types-explained",
    tags: ["DNS", "Guide", "Fundamentals"],
    author: "SubDNS Team",
  },
  {
    title: "How to Deploy a Next.js App with a Custom Subdomain on SubDNS",
    excerpt: "A complete walkthrough for deploying your Next.js application to Vercel and connecting it to your SubDNS subdomain in minutes.",
    content: `Next.js is one of the most popular frameworks for building modern web applications. Combined with Vercel for hosting and SubDNS for DNS management, you can go from development to production in under ten minutes.

## Prerequisites

Before you start, make sure you have:

- A Next.js application ready to deploy
- A SubDNS account with a registered subdomain
- A Vercel account (free tier works fine)

## Step 1: Deploy your Next.js app to Vercel

If you have not deployed to Vercel before, the process is straightforward:

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

Follow the interactive prompts. Vercel will automatically detect that you are using Next.js and configure the build settings for you. After the deployment completes, Vercel assigns your project a URL like \`your-project.vercel.app\`.

## Step 2: Configure your SubDNS subdomain

Create a CNAME record pointing to your Vercel deployment:

\`\`\`bash
subdns dns add my-project \\
  --type CNAME \\
  --value your-project.vercel.app \\
  --proxied true
\`\`\`

The \`--proxied true\` flag enables Cloudflare's proxy, which gives you DDoS protection, SSL termination, and CDN caching on top of Vercel's infrastructure.

## Step 3: Add your domain to Vercel

In the Vercel dashboard, navigate to your project settings and find the Domains section. Add your SubDNS subdomain:

\`\`\`
my-project.m2hio.in
\`\`\`

Vercel will prompt you to verify domain ownership. Since you already pointed the CNAME record to Vercel, this verification happens automatically within a few minutes.

## Step 4: Configure SSL

SubDNS with Cloudflare proxy handles SSL termination at the edge. In the Cloudflare dashboard, set your SSL/TLS encryption mode to Full (strict). This ensures traffic between Cloudflare and Vercel is also encrypted.

## Step 5: Set up preview deployments

One of the best features of Vercel is automatic preview deployments for every pull request. You can integrate this with SubDNS to give each preview a unique subdomain:

\`\`\`yaml
# .github/workflows/preview.yml
name: Preview Deployment
on: pull_request
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx vercel --token \${{ secrets.VERCEL_TOKEN }}
      - name: Create preview subdomain
        run: |
          curl -X POST https://subdns.m2hio.in/subdomains \\
            -H "Authorization: Bearer \${{ secrets.SUBDNS_API_KEY }}" \\
            -H "Content-Type: application/json" \\
            -d '{"name": "pr-\${{ github.event.number }}", "proxied": true}'
      - run: |
          curl -X POST https://subdns.m2hio.in/dns \\
            -H "Authorization: Bearer \${{ secrets.SUBDNS_API_KEY }}" \\
            -H "Content-Type: application/json" \\
            -d '{
              "subdomain": "pr-\${{ github.event.number }}",
              "type": "CNAME",
              "name": "@",
              "value": "\${{ secrets.VERCEL_DEPLOYMENT_URL }}"
            }'
\`\`\`

Now every pull request gets its own subdomain like \`pr-42.m2hio.in\` with automatic SSL and Cloudflare proxying.

## Performance considerations

Because SubDNS uses Cloudflare's edge network, your Next.js application benefits from additional performance optimizations:

- Static pages are cached at Cloudflare's edge, reducing load on Vercel's serverless functions
- Dynamic routes benefit from Cloudflare's Argo Smart Routing, which finds the fastest network path between Cloudflare and your Vercel deployment
- Images served through Next.js Image Optimization can be cached at the edge for faster subsequent loads

## Troubleshooting

If your subdomain does not resolve immediately, DNS propagation can take anywhere from a few minutes to 48 hours. You can check propagation status using:

\`\`\`bash
dig my-project.m2hio.in
\`\`\`

If the record shows as proxied (Cloudflare IP addresses), everything is working correctly. If it shows your origin IP, check that Cloudflare proxy is enabled in your SubDNS settings.

## Next steps

Once your Next.js app is deployed and connected, you can explore advanced configurations like using SubDNS for environment-specific subdomains (staging, production, feature branches) or setting up custom domains beyond the \`m2hio.in\` zone.`,
    date: "2026-06-28",
    slug: "deploy-nextjs-custom-subdomain",
    tags: ["Next.js", "Guide", "Deployment"],
    author: "SubDNS Team",
  },
  {
    title: "DNS Propagation: What Happens When You Change Your Records",
    excerpt: "Understanding DNS propagation is crucial for every developer. Learn why changes take time, how caching works, and how to speed up the process.",
    content: `You update a DNS record, wait a few minutes, refresh your browser, and nothing has changed. What is going on? The answer is DNS propagation, and understanding it will save you hours of frustration.

## What is DNS propagation?

When you update a DNS record, the change does not take effect instantly everywhere. Instead, it propagates gradually across the global DNS system as resolvers around the world refresh their cached data.

The process works like this:

1. You create or update a DNS record on SubDNS
2. SubDNS updates the authoritative nameservers for your domain
3. DNS resolvers around the world have cached the old record with a Time To Live value
4. As those caches expire, resolvers query the authoritative nameservers again
5. Each resolver picks up the new record when its cache expires

## Time To Live explained

TTL is the most important factor in DNS propagation speed. Every DNS record has a TTL value that tells resolvers how long to cache the record before checking for an update.

\`\`\`
TTL = 300 seconds (5 minutes)
\`\`\`

Low TTL values mean faster propagation but more queries to your nameservers. High TTL values reduce query load but make changes slow to propagate.

## TTL best practices

**Before a planned change**: Lower your TTL to 300 seconds (5 minutes) at least 48 hours before making the change. This gives the existing caches time to expire with the low TTL value.

\`\`\`bash
subdns dns update my-project --record-id abc123 --ttl 300
\`\`\`

**After the change**: Once the change has propagated, you can increase the TTL back to 3600 seconds (1 hour) or higher for production domains to reduce DNS query load.

**For dynamic environments**: Keep TTL at 60-300 seconds if your IP addresses change frequently. This includes environments like dynamic DNS setups or auto-scaling infrastructure.

## Factors that affect propagation time

### Your TTL setting

As mentioned, this is the primary factor. A record with a TTL of 86400 seconds (24 hours) will take up to 24 hours to fully propagate.

### ISP resolvers

Many internet service providers run their own DNS resolvers. Some of these resolvers ignore TTL values and cache records for longer than they should. This is increasingly rare, but it still happens.

### Browser caching

Modern browsers also cache DNS results. Chrome, Firefox, and Edge all have their own DNS caches with default TTLs that may not match the record's TTL. You can clear your browser's DNS cache separately from the general DNS system.

### Cloudflare proxy

When you enable Cloudflare proxy on SubDNS, propagation behaves differently. Cloudflare acts as a reverse proxy, so the DNS record always points to Cloudflare IP addresses. When you change your origin server address, only Cloudflare needs to know about it. The public DNS records do not change, so there is no propagation delay for end users.

\`\`\`bash
subdns dns add my-project --type A --value NEW_IP --proxied true
\`\`\`

This is one of the biggest advantages of using Cloudflare proxy with SubDNS. Your origin IP can change, and the outside world never notices because they are always connecting to Cloudflare.

## How to check propagation status

Several tools let you check DNS propagation from multiple locations around the world:

\`\`\`bash
# Check from your local machine
dig my-project.m2hio.in

# Check with a specific resolver
dig @8.8.8.8 my-project.m2hio.in
\`\`\`

Online tools like whatsmydns.net let you check propagation from dozens of locations simultaneously. If some locations show the old record and others show the new one, propagation is still in progress.

## What propagation is NOT

DNS propagation is often misunderstood. It is not the DNS system actively sending updates everywhere. It is simply the process of caches expiring naturally and being replaced with fresh data. There is no centralized propagation trigger.

## Common propagation myths

**Myth**: Changing your TTL makes propagation happen faster immediately. Reality: TTL changes only affect future caching. Existing caches must expire naturally.

**Myth**: There is a global DNS update broadcast. Reality: DNS uses a pull model. Resolvers fetch updates when their cache expires. There is no push notification system.

**Myth**: 24-48 hour propagation means something is broken. Reality: If your previous TTL was 86400 seconds, 24-48 hours is exactly what you should expect.

Understanding DNS propagation helps you plan changes effectively and avoid unnecessary debugging. By managing your TTL strategically and using Cloudflare proxy, you can make even major infrastructure changes with minimal disruption to your users.`,
    date: "2026-06-25",
    slug: "dns-propagation-explained",
    tags: ["DNS", "Guide", "Fundamentals"],
    author: "SubDNS Team",
  },
  {
    title: "Setting Up SPF, DKIM, and DMARC for Reliable Email Delivery",
    excerpt: "Ensure your emails land in the inbox, not the spam folder. A complete guide to configuring email authentication for your SubDNS subdomain.",
    content: `Nothing damages credibility like emails that go to spam. If you are sending email from your SubDNS subdomain, configuring SPF, DKIM, and DMARC is essential for deliverability.

## Why email authentication matters

Email was designed without built-in authentication. Anyone can send email claiming to be from any domain. Spam filters have gotten sophisticated, but without proper email authentication, even legitimate emails get flagged.

SPF, DKIM, and DMARC are three DNS-based standards that prove your emails are legitimate. They work together to build your domain's sending reputation.

## SPF: Sender Policy Framework

SPF publishes a list of servers authorized to send email on behalf of your domain. When a receiving mail server gets a message claiming to be from your domain, it checks the SPF record to verify the sending server is on the authorized list.

### Setting up SPF on SubDNS

Create a TXT record with the SPF policy:

\`\`\`bash
subdns dns add my-project \\
  --type TXT \\
  --name "@" \\
  --value "v=spf1 include:_spf.google.com include:spf.your-service.com ~all"
\`\`\`

Let us break down the components:

- \`v=spf1\` — identifies this as an SPF record
- \`include:_spf.google.com\` — authorizes Google's mail servers (if using Google Workspace)
- \`include:spf.your-service.com\` — authorizes your email service provider
- \`~all\` — soft-fail for unlisted senders. Use \`-all\` for hard-fail if you are certain

### SPF limitations

SPF has a limit of ten DNS lookups per record. This includes the initial lookup and all included domains. Exceeding this limit causes SPF to fail permanently. If you need more providers, consider consolidating or using a third-party email forwarding service.

## DKIM: DomainKeys Identified Mail

DKIM adds a digital signature to every outgoing email. The signature is verified against a public key published in your DNS records. This proves the email has not been tampered with in transit.

### Setting up DKIM

Your email provider generates a DKIM key pair. They give you a public key to publish as a TXT record:

\`\`\`bash
subdns dns add my-project \\
  --type TXT \\
  --name "google._domainkey" \\
  --value "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
\`\`\`

The record name typically includes a selector (like \`google\` for Google Workspace). Your email provider specifies the exact selector to use.

DKIM keys should be rotated periodically. When rotating, you can publish two keys simultaneously using different selectors, then switch your email system to sign with the new key before removing the old one.

## DMARC: Domain-based Message Authentication, Reporting, and Conformance

DMARC ties SPF and DKIM together and tells receiving servers what to do when authentication fails. It also provides reports about who is sending email from your domain.

### Setting up DMARC

Create a TXT record for \`_dmarc\`:

\`\`\`bash
subdns dns add my-project \\
  --type TXT \\
  --name "_dmarc" \\
  --value "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@example.com"
\`\`\`

DMARC policies:

- \`p=none\` — no action (use for monitoring only)
- \`p=quarantine\` — mark failing emails as spam
- \`p=reject\` — reject failing emails entirely

Start with \`p=none\` to collect reports, then move to \`p=quarantine\` and eventually \`p=reject\` as you validate your email setup.

### DMARC reports

The \`rua\` tag specifies where aggregate DMARC reports are sent. These reports show you who is sending email from your domain, how much is passing authentication, and whether anyone is attempting spoofing attempts.

## Testing your configuration

After setting up all three records, test your configuration:

\`\`\`bash
# Check SPF record
dig my-project.m2hio.in TXT

# Check DKIM record
dig google._domainkey.my-project.m2hio.in TXT

# Check DMARC record
dig _dmarc.my-project.m2hio.in TXT
\`\`\`

Send a test email and check the full headers. Most email clients let you view raw message headers, which show SPF, DKIM, and DMARC results.

## Common mistakes

**Mixing up record names**: SPF goes on the root domain (\`@\`), DKIM uses a selector prefix, and DMARC goes on \`_dmarc\`. Getting these wrong is the most common error.

**Missing include for all senders**: If you send email from multiple services, each needs to be in your SPF record. Missing one causes those emails to fail SPF checks.

**DMARC policy too strict too early**: Setting \`p=reject\` before verifying all legitimate email sources causes legitimate email to be rejected.

## Monitoring ongoing

Email authentication is not a set-and-forget configuration. Review your DMARC reports monthly to ensure no unauthorized senders are using your domain and that all legitimate services are properly authenticated.

With SPF, DKIM, and DMARC properly configured on your SubDNS subdomain, your emails have the best chance of landing in the inbox where they belong.`,
    date: "2026-06-22",
    slug: "spf-dkim-dmarc-guide",
    tags: ["Email", "Security", "Guide"],
    author: "SubDNS Team",
  },
  {
    title: "Dynamic DNS with SubDNS: A Complete Guide",
    excerpt: "Running a server from home? Learn how to use SubDNS for dynamic DNS so your home server is always reachable, even when your IP changes.",
    content: `Running services from a home server is a great way to learn about infrastructure, host personal projects, or serve content without monthly hosting fees. There is one problem: your ISP probably assigns a dynamic IP address that changes periodically. Dynamic DNS solves this.

## What is Dynamic DNS?

Dynamic DNS (DDNS) is a system that automatically updates your DNS records when your IP address changes. Instead of manually updating your A record every time your ISP changes your IP, DDNS handles it for you.

## Why you need it

Home internet connections typically use dynamic IP addresses. Your ISP assigns an IP from a pool, and that IP can change:

- After your modem or router reboots
- At regular intervals set by your ISP
- When your ISP makes network changes

Without DDNS, your DNS records become stale after an IP change, and visitors cannot reach your server.

## Option 1: Using the SubDNS API for DDNS

SubDNS provides a REST API endpoint specifically for DDNS updates. You can call it from a cron job on your home server:

\`\`\`bash
#!/bin/bash
# /etc/cron.hourly/subdns-ddns

# Get current public IP
CURRENT_IP=$(curl -s https://api.ipify.org)

# Update DNS record via SubDNS API
curl -X PUT https://subdns.m2hio.in/dns/update \\
  -H "Authorization: Bearer $SUBDNS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "subdomain": "my-home-server",
    "type": "A",
    "name": "@",
    "value": "'"$CURRENT_IP"'"
  }'
\`\`\`

Set this script to run every hour via cron. Most ISPs do not change IPs more frequently than every 24 hours, so hourly checks are sufficient.

## Option 2: Using the SubDNS CLI

If you prefer the CLI, you can use the same approach with our command-line tool:

\`\`\`bash
#!/bin/bash
CURRENT_IP=$(curl -s https://api.ipify.org)
subdns dns update my-home-server --record-id abc123 --value $CURRENT_IP
\`\`\`

## Option 3: Router-based DDNS

Many home routers support built-in DDNS clients. If your router supports custom DDNS providers, you can configure it with the SubDNS API endpoint:

| Field | Value |
|-------|-------|
| URL | https://subdns.m2hio.in/ddns/update |
| Hostname | my-home-server.m2hio.in |
| Username | Your API key ID |
| Password | Your API secret |

Check your router's documentation for the exact configuration fields. Most routers support DynDNS-compatible custom providers.

## Best practices for home servers

### Use Cloudflare proxy

When you enable Cloudflare proxy on your DDNS subdomain, the public DNS record always shows Cloudflare IP addresses. Your origin IP changes are invisible to the outside world.

\`\`\`bash
subdns dns add my-home-server --type A --value 0.0.0.0 --proxied true
\`\`\`

This provides an additional layer of security because your home IP address is never exposed in DNS.

### Set up a low TTL

For DDNS, use a TTL of 60-120 seconds. This ensures DNS resolvers cache your record for a short time only:

\`\`\`bash
subdns dns update my-home-server --record-id abc123 --ttl 120
\`\`\`

### Monitor your DDNS updates

Set up logging for your DDNS script to track IP changes:

\`\`\`bash
echo "$(date): IP changed to $CURRENT_IP" >> /var/log/subdns-ddns.log
\`\`\`

### Security considerations

**Firewall your server**: A home server is only as secure as your home network. Make sure your router's firewall is configured correctly and only necessary ports are open.

**Use SSH keys**: If you are SSH-ing into your home server, disable password authentication and use SSH keys only.

**Keep software updated**: Home servers are easy to forget about. Set up automatic security updates.

## What to host with DDNS

Once your dynamic DNS is working, here are some things you can host:

- A personal VPN server using WireGuard or OpenVPN
- A Nextcloud instance for file syncing
- A Jellyfin or Plex media server
- A development or staging web server
- Game servers for you and your friends
- A home automation dashboard

Dynamic DNS makes your home server a first-class citizen of the internet. Combined with SubDNS and Cloudflare proxy, your home-hosted services are secure, fast, and always reachable.`,
    date: "2026-06-20",
    slug: "dynamic-dns-guide",
    tags: ["DNS", "Guide", "Homelab"],
    author: "SubDNS Team",
  },
  {
    title: "Hosting a Static Site on GitHub Pages with Your Own Subdomain",
    excerpt: "GitHub Pages is free and fast. Connect it to your SubDNS subdomain for a professional URL on your personal or project site.",
    content: `GitHub Pages is one of the most popular free hosting platforms, and for good reason. It integrates seamlessly with your git workflow, supports static site generators, and is backed by a global CDN. Pair it with a SubDNS subdomain for a clean, professional URL.

## Prerequisites

- A GitHub repository with your static site content
- A SubDNS account with a registered subdomain

## Step 1: Configure GitHub Pages

In your repository, go to Settings, then Pages. Under Source, select Deploy from a branch and choose the branch you want to deploy from (usually \`main\` or \`gh-pages\`).

GitHub will give you a URL like \`your-username.github.io/repository-name\`.

## Step 2: Configure your custom domain in GitHub

In the same Pages settings page, enter your SubDNS subdomain:

\`\`\`
my-project.m2hio.in
\`\`\`

GitHub will attempt to verify domain ownership automatically. If it does not verify immediately, that is normal. Proceed to the next step.

## Step 3: Create the DNS records on SubDNS

For GitHub Pages, you need a CNAME record pointing to \`your-username.github.io\`:

\`\`\`bash
subdns dns add my-project \\
  --type CNAME \\
  --name "@" \\
  --value your-username.github.io \\
  --proxied true
\`\`\`

If your repository uses the organization Pages pattern (\`organization.github.io\` as the repository name), GitHub expects the CNAME to point to \`organization.github.io\`.

## Step 4: Enable HTTPS

Once your DNS records are configured and GitHub detects the custom domain, it automatically provisions an SSL certificate through Let's Encrypt and enables HTTPS. This process can take up to 15 minutes.

With Cloudflare proxy enabled on SubDNS, you also get Cloudflare's universal SSL. You can set SSL/TLS mode to Full (strict) in the Cloudflare dashboard for end-to-end encryption.

## Benefits of using Cloudflare proxy with GitHub Pages

GitHub Pages already has a CDN, but adding Cloudflare proxy through SubDNS gives you additional benefits:

**DDoS protection**: Cloudflare's network absorbs attacks before they reach GitHub Pages.

**Enhanced caching**: Cloudflare caches your static assets at 330+ edge locations, potentially outperforming GitHub's native CDN for some regions.

**Analytics**: Cloudflare provides traffic analytics, including request counts, bandwidth usage, and cache hit ratios.

**Security rules**: You can configure IP blocking, rate limiting, and bot management through Cloudflare.

## Using a static site generator

Most static site generators work well with GitHub Pages and SubDNS:

### Jekyll

GitHub Pages natively supports Jekyll. Create a \`CNAME\` file in your repository root with your subdomain:

\`\`\`
my-project.m2hio.in
\`\`\`

Jekyll will use this file for DNS configuration, and your site will be accessible at your SubDNS subdomain.

### Hugo

For Hugo sites, configure the base URL in your \`config.toml\`:

\`\`\`toml
baseURL = "https://my-project.m2hio.in"
\`\`\`

Build your site and push the output to your GitHub Pages branch.

### Next.js static export

Next.js can export a fully static site:

\`\`\`bash
next build && next export
\`\`\`

Configure the base path in \`next.config.js\` if deploying to a subdirectory, or leave it as the root for a project site.

## Automating deployments

Set up a GitHub Actions workflow to deploy automatically:

\`\`\`yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
\`\`\`

## Troubleshooting

**GitHub shows "Site not found"**: DNS propagation may still be in progress. Wait a few minutes and check with \`dig\`.

**SSL certificate not provisioning**: GitHub needs the CNAME record to resolve before it can issue a certificate. Ensure your CNAME is correct and propagation is complete.

**Mixed content warnings**: If your site loads resources over HTTP, browsers will block them on HTTPS pages. Use relative URLs or protocol-relative URLs for all resources.

GitHub Pages and SubDNS are a powerful combination for hosting static sites. You get GitHub's reliability and deployment workflow with the professional touch of a custom subdomain, Cloudflare's performance, and automatic SSL.`,
    date: "2026-06-18",
    slug: "github-pages-custom-domain",
    tags: ["GitHub", "Guide", "Static Sites"],
    author: "SubDNS Team",
  },
  {
    title: "SSL/TLS Certificates Explained: From Let's Encrypt to Auto-Provisioning",
    excerpt: "Every SubDNS subdomain comes with automatic SSL. Understand how SSL certificates work, why they matter, and how we automate the entire process.",
    content: `SSL and TLS are the foundation of secure web communication. Every SubDNS subdomain comes with automatic SSL certificate provisioning. Here is how it works and why it matters.

## What is SSL/TLS?

SSL (Secure Sockets Layer) and its successor TLS (Transport Layer Security) are cryptographic protocols that encrypt data between a client and a server. When you visit a website with HTTPS, your browser and the server establish a TLS connection that prevents eavesdropping, tampering, and forgery.

The padlock icon in your browser's address bar means a valid TLS certificate is installed and the connection is encrypted.

## How certificates work

A TLS certificate is a digital document that binds a cryptographic key pair to a domain name. It contains:

- The domain name it is issued for
- The public key
- The certificate authority that issued it
- The validity period
- A digital signature from the certificate authority

When your browser connects to a secure site, the server presents its certificate. Your browser verifies the signature against trusted certificate authorities, confirms the domain matches, and establishes an encrypted session.

## Certificate authorities

Certificate authorities (CAs) are trusted organizations that issue certificates. Your browser and operating system come preloaded with a list of trusted root CAs.

### Let's Encrypt

Let's Encrypt is a free, automated, and open certificate authority run by the Internet Security Research Group. It is the most popular CA on the internet, issuing over 300 million certificates. Let's Encrypt certificates are valid for 90 days and must be renewed periodically.

### Other CAs

Commercial CAs like DigiCert, GlobalSign, and Sectigo offer certificates with longer validity periods and additional features like extended validation (EV). For most use cases, Let's Encrypt provides the same level of encryption at no cost.

## How SubDNS automates SSL

When you create a subdomain through SubDNS, our system automatically:

1. Creates the DNS record with Cloudflare proxy enabled
2. Configures Cloudflare to issue a Universal SSL certificate through their partnership with Let's Encrypt
3. Renews the certificate automatically before it expires
4. Applies the certificate to your subdomain

This all happens within seconds of creating your subdomain. You never need to think about certificate management.

## SSL/TLS modes explained

When using Cloudflare proxy with SubDNS, there are several encryption modes:

### Flexible
Encryption between the visitor and Cloudflare, but not between Cloudflare and your origin server. This is the default mode.

### Full
Encryption between all parties, but Cloudflare does not verify your origin certificate. This works if your origin has a self-signed certificate.

### Full (strict)
Encryption between all parties with certificate validation. This is the recommended mode. Your origin must have a valid certificate.

\`\`\`bash
# Recommended: set SSL to Full (strict)
subdns dns add my-project --type A --value 203.0.113.1 --proxied true
\`\`\`

## Why auto-provisioning matters

Before Let's Encrypt, getting a TLS certificate was a manual process involving form filling, email verification, and sometimes payment. Auto-provisioning changed the landscape:

**No more expired certificates**: Expired certificates are a leading cause of website errors. Auto-renewal eliminates this problem.

**HTTPS everywhere**: When SSL is free and automatic, there is no excuse for serving content over HTTP.

**Improved SEO**: Google uses HTTPS as a ranking signal. Sites with valid certificates rank higher in search results.

**Better security**: Automatic, short-lived certificates (90 days for Let's Encrypt) limit the window of vulnerability if a private key is compromised.

## Checking your certificate

You can inspect your subdomain's certificate details:

\`\`\`bash
# Using OpenSSL
openssl s_client -connect my-project.m2hio.in:443 -servername my-project.m2hio.in

# Using curl
curl -vI https://my-project.m2hio.in
\`\`\`

Look for the certificate validity dates, the issuer, and the subject alternative names (SANs) to verify everything is configured correctly.

## Common SSL issues

**Certificate not yet issued**: When you first create a subdomain, it can take up to 60 seconds for the certificate to provision. This is normal.

**Mixed content**: Your certificate is valid, but some resources on your page load over HTTP. Browsers block mixed content by default. Use relative URLs or ensure all resources load over HTTPS.

**Certificate name mismatch**: The certificate is issued for a different domain than what you are accessing. This usually means you need to ensure the domain in your browser URL matches exactly what the certificate covers.

SubDNS handles SSL automatically so you can focus on building your application, not managing certificates. Every subdomain gets modern, industry-standard encryption without any configuration.`,
    date: "2026-06-16",
    slug: "ssl-tls-certificates-guide",
    tags: ["SSL", "Security", "Guide"],
    author: "SubDNS Team",
  },
  {
    title: "Google Search Console Domain Verification: A Step-by-Step Guide",
    excerpt: "Get your SubDNS subdomain verified in Google Search Console to monitor search performance, identify issues, and optimize your presence.",
    content: `Google Search Console is an essential tool for anyone who wants their website to appear in Google search results. It helps you monitor your site's search performance, identify and fix indexing issues, and understand how Google sees your site. Before you can use it, you need to prove you own the domain. Here is how to verify your SubDNS subdomain.

## What is domain verification?

Domain verification is Google's way of confirming that you control the website you are claiming. Once verified, Search Console gives you access to search analytics, indexing status, and technical issue reports.

## Method 1: DNS TXT record verification

This is the most reliable method and works with any domain provider. Google gives you a unique verification string that you add as a TXT record on your subdomain.

### Step 1: Get your verification string

In Google Search Console, add your property. Choose Domain instead of URL prefix. Enter your subdomain:

\`\`\`
my-project.m2hio.in
\`\`\`

Google provides a TXT record value like:

\`\`\`
google-site-verification=abcdef1234567890
\`\`\`

### Step 2: Add the TXT record on SubDNS

Using the CLI or web dashboard, create the TXT record:

\`\`\`bash
subdns dns add my-project \\
  --type TXT \\
  --name "@" \\
  --value "google-site-verification=abcdef1234567890"
\`\`\`

### Step 3: Verify in Search Console

Go back to Google Search Console and click Verify. Google checks for the TXT record and confirms ownership if it finds the matching string.

## Method 2: HTML file upload

If your subdomain is already serving content, you can verify by uploading a specific HTML file.

### Step 1: Get the verification file

Google provides an HTML file named something like \`googleabcdef1234567890.html\`. Place this file in the root of your web server or static site.

### Step 2: Ensure it is accessible

The file must be accessible at:

\`\`\`
https://my-project.m2hio.in/googleabcdef1234567890.html
\`\`\`

### Step 3: Verify

Click Verify in Google Search Console. Google checks for the file and confirms ownership.

## Method 3: Google Analytics

If your subdomain already has Google Analytics installed, you can verify through the Analytics property.

This method works automatically if you use the same Google account for both Search Console and Analytics, and the Analytics tracking code is present on your subdomain's pages.

## Method 4: Google Tag Manager

Similar to Analytics, if you have Google Tag Manager installed on your subdomain, you can use it for verification.

## After verification

Once your domain is verified, Google Search Console provides several valuable insights:

### Performance reports

See which search queries drive traffic to your subdomain, your average position in search results, your click-through rate, and total impressions over time.

### Index coverage

Check which pages of your subdomain are indexed by Google, identify pages that failed to index, and understand why.

### URL inspection

Test specific URLs on your subdomain to see how Googlebot renders them and whether there are any indexing issues.

### Sitemap submission

Submit your sitemap to help Google discover all the pages on your subdomain:

\`\`\`
https://my-project.m2hio.in/sitemap.xml
\`\`\`

### Core Web Vitals

Monitor your subdomain's real-world performance metrics including Largest Contentful Paint, First Input Delay, and Cumulative Layout Shift.

## Maintaining verification

DNS TXT record verification is permanent until you remove the record. If you change the verification method or the record gets deleted, Search Console loses access and you need to verify again. Keep the TXT record in place even after verification to prevent interruptions.

## Multiple properties

You can verify the same subdomain in multiple Google Search Console properties for different views:

- A Domain property covers all protocols (HTTP and HTTPS) and all subdomains
- URL prefix properties let you focus on specific subdomain variations

For most SubDNS users, the Domain property is the right choice because it provides the most comprehensive data.

## Troubleshooting

**Verification keeps failing**: Check that your TXT record matches exactly. Google's verification string is case-sensitive. Also check DNS propagation.

**No data after verification**: It can take 24-48 hours for Search Console to start showing data. This is normal.

**Domain verified but property shows no data**: Make sure Googlebot can access your subdomain. Check that you are not blocking Googlebot in your robots.txt file.

Google Search Console is one of the most valuable tools for understanding your website's search performance. Combined with the SEO benefits of a custom SubDNS subdomain, it gives you full visibility into how your corner of the internet performs in Google's search results.`,
    date: "2026-06-14",
    slug: "google-search-console-verification",
    tags: ["SEO", "Guide", "Google"],
    author: "SubDNS Team",
  },
  {
    title: "Building a Preview Deployment Pipeline with GitHub Actions",
    excerpt: "Give every pull request its own subdomain. Automate preview deployments so your team can review changes in a production-like environment.",
    content: `Code reviews work best when reviewers can actually interact with the changes. A preview deployment creates a live, production-like environment for every pull request. Here is how to build this workflow using SubDNS and GitHub Actions.

## Why preview deployments matter

Traditional code reviews rely on reading diff output and imagining how the changes will behave. Preview deployments remove the guesswork. Reviewers can click a link and see exactly what the changes look like in a real browser, connected to real services.

The result is faster reviews, fewer merge conflicts, and more confident deployments.

## Architecture overview

The workflow has three components:

1. A CI job that builds and deploys your application
2. A script that creates a SubDNS subdomain for the preview
3. A cleanup job that removes the subdomain when the PR closes

## Step 1: Set up your GitHub Actions workflow

Create \`.github/workflows/preview.yml\` in your repository:

\`\`\`yaml
name: Preview Deployment
on:
  pull_request:
    types: [opened, synchronize, reopened]
jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Deploy to hosting
        run: |
          # Replace with your deploy command
          npx vercel --token \${{ secrets.VERCEL_TOKEN }} \\
            --env PREVIEW=true

      - name: Create preview subdomain
        run: |
          PR_NUMBER=\${{ github.event.number }}
          SUBDOMAIN="pr-\${{ github.event.number }}"
          
          # Create the subdomain
          curl -X POST https://subdns.m2hio.in/subdomains \\
            -H "Authorization: Bearer \${{ secrets.SUBDNS_API_KEY }}" \\
            -H "Content-Type: application/json" \\
            -d "{\"name\": \"$SUBDOMAIN\", \"proxied\": true}"
          
          # Add DNS record pointing to deployment
          curl -X POST https://subdns.m2hio.in/dns \\
            -H "Authorization: Bearer \${{ secrets.SUBDNS_API_KEY }}" \\
            -H "Content-Type: application/json" \\
            -d "{
              \"subdomain\": \"$SUBDOMAIN\",
              \"type\": \"CNAME\",
              \"name\": \"@\",
              \"value\": \"preview-\$PR_NUMBER.myhosting.com\"
            }"
          
          echo "Preview URL: https://$SUBDOMAIN.m2hio.in"

      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        with:
          script: |
            const subdomain = \`pr-\${{ github.event.number }}\`;
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: \`✨ Preview deployment ready!\n\nURL: https://\${subdomain}.m2hio.in\n\`
            });
\`\`\`

## Step 2: Clean up when PR closes

Add a separate workflow to remove the preview subdomain when the pull request is merged or closed:

\`\`\`yaml
name: Cleanup Preview
on:
  pull_request:
    types: [closed]
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Remove preview subdomain
        run: |
          SUBDOMAIN="pr-\${{ github.event.number }}"
          curl -X DELETE "https://subdns.m2hio.in/subdomains/$SUBDOMAIN" \\
            -H "Authorization: Bearer \${{ secrets.SUBDNS_API_KEY }}"
\`\`\`

## Step 3: Configure secrets

In your GitHub repository settings, add these secrets:

- \`SUBDNS_API_KEY\`: Your SubDNS API key
- \`VERCEL_TOKEN\`: (or equivalent) Your hosting platform's deployment token

## Advanced patterns

### Environment-specific configurations

You can pass environment variables to indicate the PR environment:

\`\`\`bash
curl -X POST https://subdns.m2hio.in/subdomains \\
  -H "Authorization: Bearer \${{ secrets.SUBDNS_API_KEY }}" \\
  -H "Content-Type: application/json" \\
  -d "{
    \"name\": \"pr-\${{ github.event.number }}\",
    \"proxied\": true,
    \"environment\": \"preview\"
  }"
\`\`\`

### Database branching

For preview environments that need databases, consider using database branching to create an isolated copy of your production schema:

\`\`\`bash
# Create a database branch for the preview
subdns db branch pr-\${{ github.event.number }}
\`\`\`

### Concurrency limits

Limit preview deployments to one per PR to avoid unnecessary builds:

\`\`\`yaml
concurrency:
  group: preview-\${{ github.ref }}
  cancel-in-progress: true
\`\`\`

### Subdomain naming conventions

Choose a naming convention that makes previews easy to identify:

- \`pr-42.m2hio.in\` — simple and clear
- \`feature-branch-name.m2hio.in\` — descriptive but may contain invalid characters
- \`42.m2hio.in\` — minimal, just the PR number

## Best practices

**Set a low TTL**: Preview environments change frequently. Use a TTL of 60-300 seconds.

**Enable authentication**: If your preview contains sensitive data, add basic authentication or IP whitelisting.

**Monitor usage**: Preview subdomains can accumulate if cleanup fails. Set up monitoring or a scheduled cleanup for orphaned previews.

**Notify your team**: Post the preview URL to Slack or Discord via webhook so everyone knows where to review.

Preview deployments with SubDNS and GitHub Actions transform your code review process. Every pull request gets its own live environment, your team reviews with confidence, and the cleanup is fully automated.`,
    date: "2026-06-12",
    slug: "preview-deployment-pipeline",
    tags: ["DevOps", "CI/CD", "Guide"],
    author: "SubDNS Team",
  },
  {
    title: "API Key Security: Best Practices for Managing Access Tokens",
    excerpt: "Your API keys are the keys to your infrastructure. Learn how to generate, store, rotate, and audit them properly on SubDNS.",
    content: `API keys are the authentication mechanism that connects your tools to SubDNS. They provide convenient programmatic access, but they also represent a significant security risk if mishandled. A leaked API key can allow anyone to modify your DNS records, redirect your traffic, or disrupt your services.

## Understanding API key risks

An API key is essentially a password that grants access to your SubDNS account. Unlike a user password, an API key is typically stored in configuration files, CI/CD systems, and application code. Each storage location is a potential leak point.

Common API key leaks include:

- Committing keys to public git repositories
- Embedding keys in client-side JavaScript code
- Exposing keys in application logs or error messages
- Storing keys in unencrypted configuration files
- Sharing keys in team chat channels or documentation

## API key types

SubDNS supports several key types for different use cases:

**Full access keys**: Can perform any operation on any subdomain in your account. Use these sparingly, ideally only for initial setup.

**Subdomain-scoped keys**: Limited to a specific subdomain. Ideal for CI/CD pipelines that only need to manage one project.

**Read-only keys**: Can view records and settings but cannot make changes. Useful for monitoring and audit tools.

## Generating secure keys

When generating an API key in the SubDNS dashboard:

\`\`\`bash
# List your API keys
subdns api-keys list

# Create a new subdomain-scoped key
subdns api-keys create \\
  --name "ci-deploy-key" \\
  --scope "my-project" \\
  --permissions "dns:write"
\`\`\`

The generated key should be shown exactly once. Copy it immediately and store it in a secure location.

## Storage best practices

### For local development

Use environment variables, never hardcode keys:

\`\`\`bash
export SUBDNS_API_KEY=sk_your_key_here
\`\`\`

Create a \`.env\` file that is listed in \`.gitignore\`:

\`\`\`
SUBDNS_API_KEY=sk_your_key_here
\`\`\`

### For CI/CD systems

Use the platform's built-in secret management:

- GitHub Actions: Repository secrets
- GitLab CI: CI/CD variables
- CircleCI: Contexts and environment variables
- Jenkins: Credentials binding

Never pass secrets as plaintext in CI configuration files.

### For production servers

Use a dedicated secrets management solution:

- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
- Google Cloud Secret Manager
- 1Password CLI

## Rotating keys

Regular key rotation limits the damage of undetected leaks. Establish a rotation schedule:

\`\`\`bash
# Revoke an old key
subdns api-keys revoke sk_old_key

# Create a replacement
subdns api-keys create --name "ci-deploy-key-v2" --scope "my-project"
\`\`\`

**Rotation frequency recommendations**:

- Full access keys: Every 30 days
- Subdomain-scoped keys: Every 90 days
- CI/CD keys: Every 90 days or on team member departure

## Auditing key usage

SubDNS logs every API request with the key that made it. Review your audit log regularly:

\`\`\`bash
# View recent API activity
subdns audit log --hours 24

# Filter by a specific key
subdns audit log --api-key sk_abc123
\`\`\`

Look for:

- Requests from unexpected IP addresses
- Requests at unusual times
- Operations that seem out of character for the key's purpose
- Failed authentication attempts

## Incident response for key leaks

If you suspect a key has been compromised:

1. **Revoke the key immediately**: Every minute counts.
2. **Audit recent activity**: Check what the compromised key did.
3. **Rotate any affected DNS records**: If records were modified, restore them.
4. **Generate a replacement key**: Use a different name and scope.
5. **Update all systems**: Replace the old key everywhere it was used.

\`\`\`bash
# Emergency revocation
subdns api-keys revoke --force sk_compromised_key
\`\`\`

## Common mistakes to avoid

**Using the same key everywhere**: If one system gets compromised, all systems need new keys. Use scoped keys for each system.

**Storing keys in Docker images**: Keys baked into Docker images are accessible to anyone who pulls the image. Use environment variables or secrets at runtime.

**Logging API requests**: If your application logs API requests and responses, ensure the logs are sanitized to remove sensitive data.

**Forgetting to rotate**: Set calendar reminders for key rotation. Or better yet, use a secrets manager that supports automatic rotation.

## Key lifecycle summary

| Stage | Action |
|-------|--------|
| Create | Generate with minimal permissions needed |
| Store | Use environment variables or a secrets manager |
| Use | Transmit only over encrypted connections |
| Monitor | Audit usage regularly for anomalies |
| Rotate | Replace on schedule or on suspicion of compromise |
| Revoke | Remove immediately when no longer needed |

API key security is a discipline, not a one-time setup. By following these practices, you ensure that your SubDNS subdomains and DNS records remain under your control.`,
    date: "2026-06-08",
    slug: "api-key-security-best-practices",
    tags: ["Security", "API", "Guide"],
    author: "SubDNS Team",
  },
  {
    title: "Setting Up Cloudflare Tunnel with Your SubDNS Subdomain",
    excerpt: "Expose your local development server or home-hosted service without opening firewall ports. Cloudflare Tunnel creates a secure outbound connection.",
    content: `Opening ports on your home router to expose a web service feels wrong. It should. Port forwarding expands your attack surface, requires static IP configuration, and creates ongoing maintenance. Cloudflare Tunnel solves this by creating an outbound connection from your server to Cloudflare's network.

## What is Cloudflare Tunnel?

Cloudflare Tunnel (previously known as Argo Tunnel) creates an encrypted tunnel from your server to Cloudflare's edge. Instead of opening a port and pointing DNS to your IP, your server initiates an outbound connection to Cloudflare. Traffic flows through this tunnel without any open inbound ports.

The security benefits are significant. There is no exposed IP address, no open ports to scan, and no firewall rules to manage. Attackers cannot target your server because they cannot find it.

## Prerequisites

- A SubDNS subdomain with Cloudflare proxy enabled
- cloudflared installed on your server

## Step 1: Install cloudflared

\`\`\`bash
# macOS
brew install cloudflared

# Linux (x86_64)
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# Windows
# Download from the Cloudflare Tunnel documentation
\`\`\`

## Step 2: Authenticate cloudflared

\`\`\`bash
cloudflared tunnel login
\`\`\`

This opens a browser window where you authenticate with your Cloudflare account. cloudflared downloads a certificate file that authorizes it to create tunnels for your account.

## Step 3: Create a tunnel

\`\`\`bash
cloudflared tunnel create my-subdomain-tunnel
\`\`\`

This creates a tunnel with a unique ID and generates the credentials file in \`~/.cloudflared/\`.

## Step 4: Configure the tunnel

Create a configuration file:

\`\`\`yaml
# ~/.cloudflared/config.yml
tunnel: my-subdomain-tunnel
credentials-file: /root/.cloudflared/my-subdomain-tunnel.json

ingress:
  - hostname: my-project.m2hio.in
    service: http://localhost:8080
  - service: http_status:404
\`\`\`

The ingress rules map incoming requests to local services. In this example, traffic for \`my-project.m2hio.in\` is forwarded to a local web server on port 8080.

## Step 5: Route DNS through the tunnel

\`\`\`bash
cloudflared tunnel route dns my-subdomain-tunnel my-project.m2hio.in
\`\`\`

This creates a CNAME record pointing to your tunnel. SubDNS automatically picks up Cloudflare DNS changes, or you can create the record manually:

\`\`\`bash
subdns dns add my-project \\
  --type CNAME \\
  --name "@" \\
  --value "my-subdomain-tunnel.cfargotunnel.com" \\
  --proxied true
\`\`\`

## Step 6: Run the tunnel

\`\`\`bash
cloudflared tunnel run my-subdomain-tunnel
\`\`\`

Your tunnel is now live. Traffic to \`my-project.m2hio.in\` goes through Cloudflare's edge and is forwarded through the encrypted tunnel to your local server.

## Running as a service

For production use, run cloudflared as a system service:

\`\`\`bash
# Install as a systemd service
cloudflared service install

# Or run with systemctl
sudo cloudflared --config /etc/cloudflared/config.yml service install
\`\`\`

## Advanced configurations

### Multiple services on one tunnel

\`\`\`yaml
ingress:
  - hostname: api.my-project.m2hio.in
    service: http://localhost:3001
  - hostname: app.my-project.m2hio.in
    service: http://localhost:3000
  - hostname: *.my-project.m2hio.in
    service: http://localhost:8080
  - service: http_status:404
\`\`\`

### WebSocket support

Cloudflare Tunnel supports WebSocket connections without additional configuration. If your application uses WebSockets, they work through the tunnel automatically.

### Health checks

Configure tunnel health checks for reliability:

\`\`\`yaml
tunnel: my-subdomain-tunnel
credentials-file: /root/.cloudflared/my-subdomain-tunnel.json
ingress:
  - hostname: my-project.m2hio.in
    service: http://localhost:8080
    originRequest:
      noTLSVerify: false
  - service: http_status:404
warp-routing:
  enabled: true
\`\`\`

## Security considerations

**No open ports**: The most significant advantage. Your server is unreachable by port scanners.

**End-to-end encryption**: Traffic is encrypted from the visitor to Cloudflare, through the tunnel, and to your local server.

**Access controls**: Combine with Cloudflare Access to add authentication before traffic reaches your tunnel.

**Automatic updates**: Keep cloudflared updated to receive security patches.

## Troubleshooting

**Tunnel connects but returns 502**: The local service may not be running or may be listening on a different port than configured.

**Certificate errors**: Ensure the \`noTLSVerify\` option is set appropriately. For local development, you may need to set it to \`true\`.

**Connection drops**: Check your network stability. Tunnel connections are sensitive to network interruptions but reconnect automatically.

Cloudflare Tunnel combined with SubDNS gives you a secure, production-ready way to expose local services. No open ports, no static IPs, no firewall rules — just a secure tunnel to your corner of the internet.`,
    date: "2026-06-06",
    slug: "cloudflare-tunnel-setup",
    tags: ["Cloudflare", "Security", "Guide"],
    author: "SubDNS Team",
  },
  {
    title: "HTTP/2 and HTTP/3: A Developer's Guide to Modern Web Protocols",
    excerpt: "Every proxied SubDNS subdomain supports HTTP/2 and HTTP/3. Learn how these protocols improve performance and what they mean for your applications.",
    content: `The way data travels from your server to your visitors has changed dramatically. HTTP/1.1 served the web well for two decades, but modern applications demand more. HTTP/2 and HTTP/3 deliver the performance today's users expect, and every SubDNS subdomain supports them automatically.

## The evolution of HTTP

### HTTP/1.1

HTTP/1.1, standardized in 1997, was the workhorse of the early web. It is simple and reliable, but it has fundamental performance limitations:

- One request per connection
- Head-of-line blocking
- Verbose, uncompressed headers
- No server push capability

These limitations forced developers into workarounds like domain sharding, image spriting, and CSS concatenation.

### HTTP/2

HTTP/2, standardized in 2015, addressed HTTP/1.1's limitations through several key innovations:

**Multiplexing**: Multiple requests and responses can be sent simultaneously over a single TCP connection. This eliminates head-of-line blocking and reduces connection overhead.

**Header compression**: HPACK compression reduces header overhead by 80-90%, which is especially impactful for API responses and pages with many resources.

**Server push**: Servers can proactively send resources the client is likely to request, eliminating round trips.

**Binary protocol**: HTTP/2 uses binary framing instead of HTTP/1.1's text-based protocol, making parsing more efficient and less error-prone.

### HTTP/3

HTTP/3, standardized in 2022, replaces TCP with QUIC, a transport protocol built on UDP. This addresses TCP's inherent limitations:

**Faster connection establishment**: QUIC combines the TLS handshake with the transport handshake, reducing connection setup from 2-3 round trips to 1.

**No head-of-line blocking at the transport level**: In HTTP/2, packet loss on one stream can block all streams because TCP guarantees in-order delivery. QUIC runs each stream independently, so packet loss on one stream does not affect others.

**Connection migration**: QUIC connections are identified by a connection ID, not by IP address. If your client switches networks, the connection survives without re-establishment.

**Improved error correction**: QUIC includes forward error correction, reducing the impact of packet loss.

## How SubDNS enables modern HTTP protocols

When you enable Cloudflare proxy on your SubDNS subdomain, HTTP/2 and HTTP/3 are enabled automatically:

\`\`\`bash
subdns dns add my-project --type A --value 203.0.113.1 --proxied true
\`\`\`

Cloudflare terminates the connection at their edge and negotiates the best protocol with the visitor's browser. Your origin server does not need to speak HTTP/2 or HTTP/3 — Cloudflare handles the translation.

## What this means for your applications

### Automatic performance improvements

If your site has many resources (CSS files, JavaScript bundles, images), HTTP/2 multiplexing can significantly reduce load times. Resources that previously required multiple connections now share one.

### No more domain sharding

HTTP/1.1 best practices told developers to spread resources across multiple domains to bypass the per-connection limit. HTTP/2 makes this counterproductive — multiple connections bypass multiplexing benefits.

### Connection migration for mobile users

HTTP/3's connection migration is particularly valuable for mobile users who switch between WiFi and cellular networks. The connection survives the transition without interruption.

## Verifying protocol support

Check which protocol your subdomain uses:

\`\`\`bash
# Using curl
curl -vI https://my-project.m2hio.in 2>&1 | grep -i "alpn\|http"

# Using Chrome DevTools
# Open the Network tab and check the Protocol column
# "h2" means HTTP/2, "h3" means HTTP/3
\`\`\`

## Protocol negotiation

When a browser connects to your subdomain, the following negotiation happens:

1. The browser attempts an HTTP/3 (QUIC) connection
2. If the network blocks UDP, it falls back to TLS over TCP
3. During the TLS handshake, the browser and server negotiate the best HTTP version via ALPN
4. HTTP/2 is preferred over HTTP/1.1 if both support it

This graceful degradation means visitors always get the best available protocol.

## Impact on your development

### Server-Sent Events

HTTP/2 and HTTP/3 handle long-lived connections efficiently. If your application uses Server-Sent Events or similar streaming patterns, you benefit from improved connection management.

### WebSockets

WebSockets on SubDNS with Cloudflare proxy work over HTTP/2, providing efficient bidirectional communication.

### API performance

For API-heavy applications, HTTP/2's header compression is especially beneficial. API responses typically have repetitive headers, and HPACK compression significantly reduces overhead.

## Browser support

HTTP/2 is supported by 97% of browsers worldwide. HTTP/3 support has grown rapidly and is now supported by 95% of browsers. The remaining users on older browsers automatically fall back to HTTP/1.1.

## Measuring the difference

Before and after enabling Cloudflare proxy on your SubDNS subdomain, you can measure:

- **Time to First Byte**: HTTP/3 typically reduces TTFB by 10-30% for new connections.
- **Page load time**: Multiplexing can reduce load time by 15-50% for pages with many resources.
- **Connection establishment time**: HTTP/3's zero-RTT handshake eliminates connection setup time for returning visitors.

Modern web protocols are not just for large-scale applications. Every SubDNS subdomain benefits from HTTP/2 and HTTP/3 through Cloudflare proxy, giving your visitors the fastest possible experience without any configuration on your part.`,
    date: "2026-06-03",
    slug: "http2-http3-guide",
    tags: ["Performance", "Protocols", "Guide"],
    author: "SubDNS Team",
  },
  {
    title: "Deploying Web Apps on Render, Railway, and Fly.io with Custom Domains",
    excerpt: "Modern cloud platforms make deployment easy. Learn how to connect your SubDNS subdomain to Render, Railway, and Fly.io for a professional setup.",
    content: `Platform-as-a-Service providers have made deploying web applications remarkably simple. You push your code, and minutes later your application is live. But the URL they give you is usually something like \`my-app.onrender.com\` or \`my-app.up.railway.app\`. A custom subdomain on SubDNS makes it professional.

## Why use a custom domain?

A custom subdomain signals professionalism. It tells visitors they are on the right site, it improves SEO, and it makes your URLs memorable. More importantly, it decouples your URL from your hosting provider — if you switch platforms later, you just update DNS instead of changing URLs everywhere.

## Deploying on Render

Render supports custom domains with automatic SSL certificate provisioning.

### Step 1: Deploy your app on Render

Connect your repository and deploy as usual. Render provides a URL like \`my-app.onrender.com\`.

### Step 2: Add your custom domain in Render

In your Render dashboard, go to Settings, then Custom Domain. Enter your SubDNS subdomain:

\`\`\`
my-project.m2hio.in
\`\`\`

Render shows you the required DNS configuration.

### Step 3: Configure DNS on SubDNS

\`\`\`bash
# Create a CNAME record pointing to Render
subdns dns add my-project \\
  --type CNAME \\
  --name "@" \\
  --value "my-app.onrender.com" \\
  --proxied true
\`\`\`

Render detects the DNS record and automatically provisions an SSL certificate through Let's Encrypt. This usually takes 5-15 minutes.

## Deploying on Railway

Railway also supports custom domains with automatic SSL.

### Step 1: Deploy on Railway

Railway's deployment process is fully automated. Connect your repository and Railway builds and deploys your application automatically.

### Step 2: Add a custom domain

In your Railway project, navigate to Networking, then Custom Domains. Add your subdomain:

\`\`\`
my-project.m2hio.in
\`\`\`

Railway generates a target URL for your DNS configuration.

### Step 3: Configure DNS on SubDNS

\`\`\`bash
# Railway often provides a CNAME target
subdns dns add my-project \\
  --type CNAME \\
  --name "@" \\
  --value "my-project.railway.app" \\
  --proxied true
\`\`\`

Railway validates the DNS configuration and provisions an SSL certificate. The entire process takes a few minutes.

### Railway-specific considerations

Railway assigns different deployment URLs for preview environments. You can set up separate subdomains for each environment:

\`\`\`bash
# Production
subdns dns add my-app --type CNAME --value "my-app.railway.app"

# Staging
subdns dns add staging --type CNAME --value "staging-my-app.railway.app"
\`\`\`

## Deploying on Fly.io

Fly.io uses a different approach. Instead of a CNAME, Fly.io typically uses A records that point to their anycast IP addresses.

### Step 1: Deploy on Fly.io

\`\`\`bash
fly launch
fly deploy
\`\`\`

### Step 2: Configure DNS on SubDNS

Fly.io provides specific IP addresses or a CNAME target for your app. Check with \`fly ips list\`:

\`\`\`bash
subdns dns add my-project \\
  --type A \\
  --name "@" \\
  --value "FLY_IO_IP_ADDRESS" \\
  --proxied true
\`\`\`

### Step 3: Add the domain to Fly.io

\`\`\`bash
fly certs create my-project.m2hio.in
\`\`\`

Fly.io provisions an SSL certificate and handles renewal automatically. You can verify the certificate status:

\`\`\`bash
fly certs show my-project.m2hio.in
\`\`\`

## Generic DNS configuration pattern

Most PaaS providers follow one of two patterns:

**CNAME pattern**: The provider gives you a target domain. Create a CNAME record. Used by Render, Railway, Heroku, and Netlify.

**A record pattern**: The provider gives you IP addresses. Create A records. Used by Fly.io, DigitalOcean App Platform, and some dedicated hosting providers.

In both cases, enabling Cloudflare proxy through SubDNS provides additional benefits beyond what the PaaS offers natively.

## Multi-environment setup

For professional projects, set up multiple environments:

\`\`\`
production.m2hio.in → production deployment
staging.m2hio.in → staging deployment
pr-42.m2hio.in → preview deployment
\`\`\`

Each environment gets its own subdomain, its own DNS record, and its own SSL certificate — all managed through SubDNS.

## Common issues

**SSL certificate not provisioning**: The PaaS needs to verify domain ownership before issuing a certificate. Ensure your DNS records are correct and have propagated.

**Redirect loops**: If both the PaaS and Cloudflare handle SSL termination, you may encounter redirect loops. Set SSL/TLS mode to Full (strict) in Cloudflare and ensure your application respects the \`X-Forwarded-Proto\` header.

**Mixed content**: With HTTPS enabled through both the PaaS and Cloudflare, ensure all resources load over HTTPS. Most PaaS platforms handle this automatically, but check your application for hardcoded HTTP URLs.

## Why Cloudflare proxy matters on PaaS

Even though Render, Railway, and Fly.io all provide SSL and CDN capabilities, adding Cloudflare proxy through SubDNS gives you:

- A unified DNS management interface for all your services
- Additional DDoS protection at the network edge
- Detailed analytics and traffic insights
- Advanced caching and performance optimization rules
- Bot management and security rule engine

Modern PaaS platforms eliminate infrastructure management. SubDNS eliminates DNS complexity. Together, they let you focus entirely on building your application.`,
    date: "2026-05-30",
    slug: "deploy-paas-custom-domain",
    tags: ["Deployment", "Guide", "PaaS"],
    author: "SubDNS Team",
  },
  {
    title: "Wildcard DNS Records: When and How to Use Them Effectively",
    excerpt: "Wildcard records let you match any subdomain with a single entry. Learn how to use them for preview deployments, multi-tenant apps, and more.",
    content: `Wildcard DNS records are one of the most powerful features in the DNS toolkit. A single wildcard record can handle traffic for any number of subdomains, making them invaluable for certain architectures.

## What is a wildcard DNS record?

A wildcard DNS record matches any subdomain name that is not explicitly defined by another record. It is specified using an asterisk as the leftmost label:

\`\`\`
*.m2hio.in  A  203.0.113.1
\`\`\`

This record matches \`anything.m2hio.in\`, \`random-name.m2hio.in\`, \`abc123.m2hio.in\`, and so on. It does not match the root domain (\`m2hio.in\`) itself.

## How wildcard records work

When a DNS resolver looks up a subdomain:

1. It first checks for an exact match (\`specific-name.m2hio.in\`)
2. If no exact match exists, it checks for a wildcard match (\`*.m2hio.in\`)
3. If neither exists, it returns NXDOMAIN (domain not found)

This fallback behavior makes wildcard records ideal for catch-all scenarios.

## Use case 1: Preview deployments

If your CI system creates subdomains dynamically for pull request previews, a wildcard record eliminates the need to create a DNS record for each preview:

\`\`\`
*.pr.m2hio.in  CNAME  preview-platform.example.com
\`\`\`

Now \`pr-42.pr.m2hio.in\` and \`pr-43.pr.m2hio.in\` both resolve without any additional DNS configuration.

## Use case 2: Multi-tenant SaaS platforms

If you run a SaaS platform where each customer gets a subdomain, a wildcard record lets you route all customer subdomains to your application server:

\`\`\`
*.app.m2hio.in  A  203.0.113.1
\`\`\`

Your application handles the routing logic based on the subdomain:

\`\`\`javascript
// Example: Express.js subdomain routing
app.use((req, res, next) => {
  const subdomain = req.hostname.split('.')[0];
  req.tenant = tenants[subdomain];
  next();
});
\`\`\`

## Use case 3: Regional or environment routing

Route different regions or environments to different servers:

\`\`\`
*.eu.m2hio.in  A  203.0.113.10
*.us.m2hio.in  A  203.0.113.20
*.asia.m2hio.in  A  203.0.113.30
\`\`\`

## Use case 4: Branded tracking links

For marketing campaigns or analytics, wildcard records let you create unique tracking URLs for each campaign:

\`\`\`
*.go.m2hio.in  CNAME  tracking-service.example.com
\`\`\`

## Important limitations

**No wildcard at the root**: Wildcard records only match subdomains. The root domain (\`m2hio.in\`) must have its own A or AAAA record.

**Exact matches take precedence**: If you have both a wildcard and an explicit record for the same subdomain, the explicit record wins. This lets you override the wildcard for specific subdomains.

**No wildcard for SOA and NS records**: Wildcard records do not apply to the zone's authoritative records.

**CNAME restrictions**: You cannot have a wildcard CNAME that coexists with other record types on the same name. DNS standards prohibit this.

## Wildcard with Cloudflare proxy

When using SubDNS with Cloudflare proxy, wildcard records work slightly differently:

\`\`\`bash
subdns dns add my-project \\
  --type A \\
  --name "*" \\
  --value 203.0.113.1 \\
  --proxied true
\`\`\`

Cloudflare automatically provisions SSL certificates for the wildcard domain, covering all subdomains. However, Cloudflare's Universal SSL covers only the root and one level of subdomain. For deeper wildcard coverage, you may need a dedicated certificate.

## Security considerations

Wildcard records are convenient, but they have security implications:

**Subdomain enumeration**: Attackers can discover valid subdomains by testing random names. A wildcard makes every name resolve, but your application must handle unknown subdomains gracefully.

**Spam and abuse**: Wildcard records can be used by attackers to create unlimited unique subdomains for phishing or spam campaigns. Implement rate limiting and abuse detection if you expose a wildcard publicly.

**Certificate transparency**: Wildcard SSL certificates are subject to Certificate Transparency logging, meaning the wildcard domain is publicly visible.

## Best practices

**Use specific wildcards**: Instead of a root-level wildcard (\`*.m2hio.in\`), use scoped wildcards (\`*.preview.m2hio.in\`, \`*.app.m2hio.in\`). This limits the wildcard's scope and reduces security risks.

**Monitor wildcard traffic**: Wildcard records can hide misconfigured or forgotten services. Use analytics to monitor what subdomains are receiving traffic.

**Combine with SPF records carefully**: SPF records with wildcard domains can cause unexpected behavior. Test your email authentication thoroughly if you use wildcards.

**Set reasonable TTLs**: Wildcard records often serve dynamic content. Use a TTL of 300-3600 seconds depending on how frequently your IP addresses change.

## Creating a wildcard on SubDNS

\`\`\`bash
# Create a wildcard A record
subdns dns add my-project \\
  --type A \\
  --name "*" \\
  --value 203.0.113.1

# Create a wildcard CNAME
subdns dns add my-project \\
  --type CNAME \\
  --name "*" \\
  --value "myapp.example.com"
\`\`\`

Wildcard DNS records are a powerful tool when used correctly. They simplify infrastructure for multi-tenant applications, preview deployments, and dynamic environments. Combined with SubDNS and Cloudflare proxy, you get the flexibility of wildcard routing with enterprise-grade performance and security.`,
    date: "2026-05-25",
    slug: "wildcard-dns-records-guide",
    tags: ["DNS", "Guide", "DevOps"],
    author: "SubDNS Team",
  },
  {
    title: "DNSSEC Explained: Protecting Your Domain from DNS Spoofing",
    excerpt: "DNS was not designed with security in mind. DNSSEC adds cryptographic verification to protect your users from poisoned DNS caches and spoofed records.",
    content: `DNS is one of the oldest protocols on the internet, and it was designed in a more trusting era. When your browser looks up a domain name, it receives an answer without any way to verify that the answer is authentic. DNSSEC fixes this by adding cryptographic signatures to DNS responses.

## The problem with plain DNS

Think of DNS as a phone book. When you look up a name, you get back a number. But in the original DNS design, there is no way to verify that the phone book has not been tampered with.

An attacker who compromises a DNS resolver or intercepts DNS traffic can redirect your users to fake websites without their knowledge. This is called DNS spoofing or DNS cache poisoning.

## What DNSSEC provides

DNSSEC (DNS Security Extensions) adds four key capabilities:

**Data origin authentication**: Proves that DNS data comes from the authoritative source
**Data integrity**: Ensures DNS data has not been modified in transit
**Authenticated denial of existence**: Proves that a domain name does not exist
**Chain of trust**: Allows resolvers to verify signatures from the root zone down to individual records

## How DNSSEC works

DNSSEC uses public key cryptography. Each zone in the DNS hierarchy has a public-private key pair:

1. The zone owner signs their DNS records with their private key
2. Resolvers verify the signatures using the public key
3. The public key is signed by the parent zone, creating a chain of trust
4. The chain starts at the DNS root zone, which is trusted by all resolvers

### Record types added by DNSSEC

- **RRSIG**: Contains the digital signature for a set of DNS records
- **DNSKEY**: Contains the public signing key
- **DS**: Delegation Signer — links a child zone to its parent
- **NSEC/NSEC3**: Provides authenticated denial of existence
- **CDNSKEY/CDS**: Child-to-parent signaling for automated key updates

## Enabling DNSSEC on SubDNS

SubDNS supports DNSSEC for all subdomains. Enabling it adds cryptographic protection to your DNS records.

### Step 1: Enable DNSSEC in your SubDNS dashboard

Navigate to your subdomain settings and toggle DNSSEC on. SubDNS generates the necessary keys and signs your zone automatically.

### Step 2: Publish the DS record (if applicable)

If you are using SubDNS with a parent domain, you need to publish the DS record at the parent registrar. SubDNS provides the DS record information after DNSSEC is enabled.

### Step 3: Verify DNSSEC is working

\`\`\`bash
# Check if DNSSEC is enabled
dig my-project.m2hio.in +dnssec

# Verify the chain of trust
delv my-project.m2hio.in
\`\`\`

A successful DNSSEC validation returns the authenticated flag on your DNS records.

## Real-world impact

### What DNSSEC prevents

- DNS cache poisoning attacks
- Man-in-the-middle DNS redirection
- Unauthorized zone transfers being used maliciously
- Phishing attacks that rely on DNS spoofing

### What DNSSEC does NOT prevent

- DDoS attacks against your DNS infrastructure
- Compromise of your DNS management account
- Attacks against your web server directly
- Phishing that uses lookalike domain names

DNSSEC is one layer of a comprehensive security strategy. It protects the DNS channel specifically.

## DNSSEC and Cloudflare proxy

When SubDNS is used with Cloudflare proxy, the interaction between DNSSEC and Cloudflare requires careful consideration:

1. SubDNS signs the DNS records with DNSSEC
2. Cloudflare proxy changes how records resolve — visitors see Cloudflare IPs, not your origin IP
3. Cloudflare handles DNSSEC compliance at their edge, ensuring signed responses

The key point: DNSSEC protects the DNS lookup itself. The connection between Cloudflare and your origin is protected separately by TLS.

## DNSSEC migration

Enabling DNSSEC on an existing domain requires planning:

1. **Generate keys** — SubDNS handles this
2. **Publish DS record** — May require action at your registrar
3. **Wait for propagation** — Parent zone must cache the new DS record
4. **Verify** — Test from multiple resolvers

If you disable DNSSEC, remove the DS record from your registrar first. Otherwise, resolvers that expect signatures will fail to resolve your domain.

## Troubleshooting DNSSEC

**DNSSEC validation failures**: Browsers and resolvers that validate DNSSEC will refuse to connect if validation fails. Common causes include expired signatures, mismatched keys, or incorrect DS records.

**Signature expiration**: DNSSEC signatures have a validity period. SubDNS automatically resigns your zone before signatures expire, but if your zone becomes unresponsive during key rotation, validation failures can occur.

**Resolver support**: Not all DNS resolvers validate DNSSEC. Major public resolvers like Google (8.8.8.8) and Cloudflare (1.1.1.1) validate by default. Some ISP resolvers do not.

## DNSSEC key management

SubDNS manages DNSSEC key generation and rotation automatically. However, understanding the key types helps:

- **Zone Signing Keys (ZSK)**: Sign individual record sets. Rotated more frequently.
- **Key Signing Keys (KSK)**: Sign the DNSKEY record set. Rotated less frequently and requires DS record updates.

SubDNS handles both key types and rotates them on a schedule that balances security with operational stability.

## Is DNSSEC right for your subdomain?

Use DNSSEC when:

- Your subdomain handles sensitive data or authentication
- You want the highest level of DNS integrity
- Your users would be harmed by DNS spoofing

You may skip DNSSEC when:

- Your subdomain is temporary or experimental
- You proxy through Cloudflare (Cloudflare provides alternative protections)
- The operational complexity outweighs the risk

DNSSEC is a critical security standard that protects the integrity of DNS. Enabling it on your SubDNS subdomain ensures your visitors always reach the server you intended, not an attacker's impersonation.`,
    date: "2026-05-22",
    slug: "dnssec-explained-guide",
    tags: ["Security", "DNS", "Guide"],
    author: "SubDNS Team",
  },
]

export const siteUrl = "https://subdns.m2hio.in"
