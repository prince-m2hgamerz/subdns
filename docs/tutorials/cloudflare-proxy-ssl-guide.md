# Cloudflare Proxy & SSL/TLS Guide

SubDNS runs on Cloudflare's global network. Every subdomain you create can optionally use Cloudflare's proxy (orange cloud) for DDoS protection, SSL management, and performance optimization. This guide explains how it all works.

---

## Cloudflare Proxy: Orange Cloud vs. Gray Cloud

Each DNS record in SubDNS has a **Proxy** toggle. Understanding this setting is critical.

### Proxied (Orange Cloud)

Traffic flows through Cloudflare's network before reaching your server:

```
Visitor → Cloudflare Edge → Your Origin Server
```

**Benefits:**
- Origin IP is hidden from attackers
- DDoS mitigation (Layer 3/4/7)
- Automatic SSL/TLS certificates
- Caching and performance optimization
- HTTP/2 and HTTP/3 support
- Bot management

**Drawbacks:**
- Adds a hop (slight latency increase, usually negligible)
- Not compatible with all services (see below)

### DNS Only (Gray Cloud)

Traffic goes directly to your server:

```
Visitor → Your Origin Server (direct)
```

**Use when:**
- Running an email server (MX records cannot be proxied)
- SSH or FTP connections
- Services that need the real client IP
- Custom VPN or game servers

---

## SSL/TLS Encryption Modes

Cloudflare offers several SSL modes. SubDNS uses **Full (strict)** by default, which is the most secure option.

### Full (Strict) — Default

```
Visitor ————[encrypted]———— Cloudflare ————[encrypted]———— Your Server
```

- End-to-end encryption
- Cloudflare requires a valid SSL certificate on your origin server
- Most hosting platforms (Vercel, Netlify, Railway) provide this automatically

### Full

```
Visitor ————[encrypted]———— Cloudflare ————[encrypted]———— Your Server
```

- End-to-end encrypted
- Cloudflare does not validate your origin certificate
- Use only if your origin has a self-signed cert or is in development

### Flexible

```
Visitor ————[encrypted]———— Cloudflare ————[unencrypted]———— Your Server
```

- Visitor to Cloudflare is encrypted
- Cloudflare to your origin is NOT encrypted
- Not recommended for production

### Off

No encryption anywhere. Never use this in production.

---

## How SSL Certificates Work

When you proxy a subdomain through Cloudflare:

1. **Certificate issuance:** Cloudflare automatically provisions an SSL certificate for `your-subdomain.m2hio.in` (and `*.m2hio.in` wildcard)
2. **Certificate renewal:** Cloudflare renews certificates automatically — no action needed
3. **Certificate validation:** Cloudflare uses its own CA (Google Trust Services / Let's Encrypt) that is trusted by all major browsers

**Time to issue:** Usually 30 seconds to 2 minutes after the DNS record is created.

---

## Common SSL Scenarios

### I see "Your Connection Is Not Secure"

1. Wait 1-2 minutes for Cloudflare to provision the certificate
2. Verify Cloudflare proxy (orange cloud) is enabled
3. Make sure your origin server supports HTTPS
4. Check that your origin's SSL certificate is valid

### My origin server uses HTTP, not HTTPS

If your origin runs on HTTP only, Cloudflare's **Flexible** mode can still encrypt the visitor-to-Cloudflare leg. However, **Full (strict)** requires your origin to support HTTPS. Most platforms support HTTPS by default — check your provider's documentation.

### I need a dedicated SSL certificate

SubDNS uses Cloudflare's shared wildcard certificate by default. This covers `*.m2hio.in` and works for all subdomains. You do not need to install a certificate on your server.

---

## Proxy Compatibility by Hosting Platform

| Platform | Proxy Support | Notes |
|----------|--------------|-------|
| Vercel | ✅ Full | Use CNAME + proxy, Vercel handles origin SSL |
| Netlify | ✅ Full | Use CNAME + proxy, Netlify handles origin SSL |
| GitHub Pages | ✅ Full | Use CNAME + proxy, enable HTTPS in repo settings |
| Railway | ✅ Full | CNAME + proxy, Railway handles origin SSL |
| Cloudflare Pages | ✅ Bypasses proxy | Direct Cloudflare routing, no double-proxy |
| Fly.io | ⚠️ Partial | Works but may need DNS-only for cert issuance |
| Koyeb | ✅ Full | CNAME + proxy, Koyeb handles origin SSL |
| Custom VPS | ⚠️ Partial | Requires origin SSL cert for Full (strict) |

---

## Performance Best Practices

### Enable Proxy for:
- Static sites and SPAs
- API endpoints behind CDN-compatible platforms
- Sites that benefit from Cloudflare's caching

### Disable Proxy (DNS Only) for:
- Email servers and SMTP traffic
- SSH, SFTP, or FTP access
- Real-time APIs (WebSockets may have issues)
- Services requiring the original visitor IP

---

## How to Verify Your Setup

```bash
# Check if Cloudflare proxy is active
dig +short your-subdomain.m2hio.in
# Proxied: returns Cloudflare IPs (104.16.x.x, 172.64.x.x)
# DNS only: returns your origin IP

# Check SSL certificate
curl -vI https://your-subdomain.m2hio.in 2>&1 | grep "SSL certificate"
```

---

## Related Guides

- [DNS Record Types](./dns-record-types-deep-dive.md) — All supported record types
- [DNS Propagation & TTL](./dns-propagation-ttl.md) — Understanding delays
- [Getting Started](./getting-started.md) — First subdomain setup
