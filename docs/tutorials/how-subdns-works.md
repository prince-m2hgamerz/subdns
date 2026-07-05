# How SubDNS Works (Deep Dive)

Understand the architecture behind the free subdomain service.

---

## The Problem

You want a custom domain like `pvchat.m2hio.in` for your project, but:
- You don't own a domain
- Buying one costs $10-15/year
- Managing DNS is painful
- You don't want Cloudflare access

## The Solution

SubDNS gives you free subdomains under `m2hio.in` — we handle all DNS and Cloudflare management so you don't have to.

---

## Architecture

```
                          ┌─────────────────────────────────────┐
                          │         Cloudflare Dashboard        │
                          │                                     │
                          │  m2hio.in zone                      │
                          │    └─ subdomain.m2hio.in → CNAME    │
                          └──────────┬──────────────────────────┘
                                     │ API
                          ┌──────────▼──────────────────────────┐
                          │         SubDNS Platform             │
                          │                                     │
                          │  Next.js 16 + TypeScript            │
                          │  PostgreSQL (Prisma ORM)            │
                          │  Upstash Redis (Cache)              │
                          │  next-auth (Auth)                   │
                          └──────────┬──────────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
     ┌────────▼────────┐  ┌─────────▼────────┐  ┌─────────▼────────┐
     │   Dashboard      │  │   REST API       │  │   CLI           │
     │   (Web UI)       │  │   (Programmatic) │  │   (Terminal)    │
     └─────────────────┘  └──────────────────┘  └──────────────────┘
              │                      │                      │
              └──────────────────────┼──────────────────────┘
                                     │
                          ┌──────────▼──────────────────────────┐
                          │        End User's Platform          │
                          │                                     │
                          │  Vercel / Netlify / Railway /       │
                          │  GitHub Pages / Cloudflare Pages    │
                          │  Fly.io / Heroku / Render / Koyeb   │
                          └─────────────────────────────────────┘
```

## The Two-Step Partnership

This is the most important concept to understand:

| Step | Who Does It | What Happens |
|------|-------------|--------------|
| **1** | **SubDNS (us)** | Creates `CNAME` record in Cloudflare: `pvchat → your-target.com` |
| **2** | **You (the user)** | Registers `pvchat.m2hio.in` as a custom domain on your hosting provider |

**SubDNS handles DNS. You handle the hosting provider.**

You do NOT need access to Cloudflare or the m2hio.in domain. You only need access to your own Vercel/Netlify/Railway dashboard.

---

## What Happens When You Claim a Subdomain

```
You click "Create" on dashboard
         │
         ▼
1. Validate: Is the name available?
         │
         ▼
2. Check: Is the target format valid?
         │
         ▼
3. Cloudflare API: Create DNS record
   POST https://api.cloudflare.com/client/v4/zones/{zone}/dns_records
   Body: { type: "CNAME", name: "pvchat", content: "myapp.vercel.app" }
         │
         ▼
4. Database: Save subdomain record
   INSERT INTO subdomains (name, domain, target, type, userId, status)
   VALUES ('pvchat', 'm2hio.in', 'myapp.vercel.app', 'CNAME', '...', 'ACTIVE')
         │
         ▼
5. Activity log entry created
         │
         ▼
6. Response sent: "Subdomain created! Add pvchat.m2hio.in to your hosting provider"
```

## What Happens When You Delete a Subdomain

```
You click "Delete" on dashboard
         │
         ▼
1. Verify: You own this subdomain
         │
         ▼
2. Cloudflare API: Delete DNS record
   DELETE https://api.cloudflare.com/client/v4/zones/{zone}/dns_records/{id}
         │
         ▼
3. Database: Delete subdomain + related records (CASCADE)
   DELETE FROM subdomains WHERE id = '...'
         │
         ▼
4. Activity log entry created
         │
         ▼
5. Response sent: "Subdomain released"
```

---

## DNS Propagation

When SubDNS creates a DNS record via Cloudflare:

```
Cloudflare edge network
         │
         ├── PoP 1 (New York)    ─── Updated instantly
         ├── PoP 2 (London)      ─── Updated in ~30s
         ├── PoP 3 (Tokyo)       ─── Updated in ~60s
         ├── PoP 4 (Mumbai)      ─── Updated in ~30s
         └── PoP 5 (São Paulo)   ─── Updated in ~60s
```

**Proxied records (orange cloud):** Near-instant global propagation (Cloudflare handles it)
**DNS-only records (gray cloud):** 1-10 minutes based on TTL

---

## Security Model

- **Authentication:** Email/password (bcrypt hashed) + API keys (random tokens)
- **Authorization:** Users can only manage their own subdomains
- **Rate Limiting:** API endpoints have rate limits to prevent abuse
- **Input Validation:** All inputs validated via Zod schemas
- **Cloudflare API:** Token-scoped access (only DNS records for the zone)
- **Reserved Names:** Critical system names are reserved
- **Activity Logging:** All actions are logged for audit

---

## Data Flow Diagram

```
                    ┌──────────────────┐
                    │    User Browser  │
                    │  / CLI / API     │
                    └────────┬─────────┘
                             │ HTTPS
                    ┌────────▼─────────┐
                    │  Next.js Routes  │
                    │  (API handlers)  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼──────┐ ┌────▼──────┐ ┌─────▼──────┐
     │   Prisma ORM  │ │  Redis    │ │  Cloudflare│
     │  (PostgreSQL) │ │  (Cache)  │ │  API       │
     └───────────────┘ └───────────┘ └────────────┘
```

---

## Limits

| Limit | Free Tier |
|-------|-----------|
| Subdomains per user | 10 |
| DNS records per subdomain | 50 |
| Subdomain name length | 63 chars max |
| Target formats | Valid hostnames, URLs, IPs |

---

## Why Use SubDNS Instead of...

| Option | Cost | DNS Management | SSL | Maintenance |
|--------|------|---------------|-----|-------------|
| **SubDNS** | Free | Automatic | Automatic | None |
| Buying your own domain | $10-15/yr | You manage | You set up | Ongoing |
| `vercel.app` subdomain | Free | Vercel managed | Vercel managed | Only Vercel |
| `netlify.app` subdomain | Free | Netlify managed | Netlify managed | Only Netlify |
| `is-a.dev` | Free | Manual via PR | Varies | PR-based |
