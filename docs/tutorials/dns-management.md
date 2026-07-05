# DNS Management Guide

SubDNS lets you manage DNS records for your subdomains beyond the default CNAME.

---

## Supported Record Types

| Type | Use Case | Example Content |
|------|----------|-----------------|
| **A** | Point to an IPv4 address | `76.76.21.21` |
| **AAAA** | Point to an IPv6 address | `2a04:4e42::1` |
| **CNAME** | Point to another domain (default) | `myapp.vercel.app` |
| **TXT** | Verification & email security | `v=spf1 include:_spf.google.com ~all` |
| **MX** | Email routing | `aspmx.l.google.com` (priority: 10) |
| **SRV** | Service discovery | `1 10 5060 sip.example.com` |
| **CAA** | Certificate authority restriction | `0 issue "letsencrypt.org"` |

---

## Managing Records via Dashboard

### Adding a DNS Record

1. Log in to your SubDNS dashboard
2. Click on the subdomain you want to manage
3. Scroll to **DNS Records** section
4. Click **Add Record**
5. Fill in:
   - **Type** — Record type (see table above)
   - **Name** — Leave blank for root, or enter a prefix (e.g. `www`)
   - **Content** — The target value
   - **TTL** — Auto (recommended) or custom
   - **Proxy** — Cloudflare proxy (orange cloud) on/off
6. Click **Save**

### Editing a DNS Record

1. Click the edit icon next to the record
2. Modify the fields
3. Click **Save**

### Deleting a DNS Record

1. Click the delete/trash icon next to the record
2. Confirm deletion

---

## Managing Records via CLI

```bash
# Add a DNS record
subdns dns add my-subdomain --type A --content 76.76.21.21 --ttl 120

# Add a proxied CNAME
subdns dns add my-subdomain --type CNAME --content myapp.vercel.app --proxied

# Add an MX record for email
subdns dns add my-subdomain --type MX --content aspmx.l.google.com --priority 10

# List all records for a subdomain
subdns info my-subdomain

# Remove a DNS record
subdns dns rm <record-id>
```

---

## Managing Records via API

```bash
# Add a DNS record
curl -X POST https://subdns.m2hio.in/api/dns \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "subdomainName": "my-subdomain",
    "type": "CNAME",
    "content": "myapp.vercel.app",
    "proxied": true
  }'

# Delete a record
curl -X DELETE https://subdns.m2hio.in/api/dns/RECORD_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Cloudflare Proxy (Orange Cloud)

When **proxied** (orange cloud):
- Cloudflare hides your origin IP
- DDoS protection enabled
- SSL/TLS managed by Cloudflare
- Caching & performance features

When **not proxied** (gray cloud):
- Direct connection to your server
- Faster DNS propagation
- Required for some services (email, SSH, etc.)

---

## SSL / TLS

By default, all proxied subdomains get:
- **Automatic SSL certificates** via Cloudflare
- **Full (strict)** encryption mode
- **Automatic HTTPS rewrites**

If you see SSL issues:
1. Make sure Cloudflare proxy is enabled
2. Wait 1-5 minutes for certificate provisioning
3. Check that your origin server supports HTTPS

---

## Propagation Times

| Scenario | Typical Time |
|----------|-------------|
| New record (proxied) | 30 seconds - 2 minutes |
| New record (DNS only) | 1 - 5 minutes |
| Record update (proxied) | Instant |
| Record update (DNS only) | 1 - 10 minutes |
| Delete record | 1 - 5 minutes |
