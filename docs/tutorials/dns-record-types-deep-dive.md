# DNS Record Types: The Complete Guide

Every time someone visits your website, sends you an email, or connects to your API, DNS records are working behind the scenes to make the connection happen. Here is everything you need to know about each record type SubDNS supports.

---

## A Record (Address)

Maps a domain name to an **IPv4 address** — the most fundamental DNS record.

**When to use:** You have a server with a static IPv4 address (e.g., a VPS on DigitalOcean, Linode, or AWS EC2).

```text
example     IN  A     76.76.21.21
```

**TTL tip:** Use 300 (5 minutes) during development so changes propagate quickly. Use 3600 (1 hour) or higher in production for better performance.

---

## AAAA Record (IPv6 Address)

Maps a domain name to an **IPv6 address**. Same concept as an A record but for the newer IPv6 protocol.

**When to use:** Your server supports IPv6 and you want visitors to reach it over IPv6.

```text
example     IN  AAAA   2a04:4e42::1
```

**Note:** Most hosting platforms automatically provide both IPv4 and IPv6. Check with your provider before adding an AAAA record.

---

## CNAME Record (Canonical Name)

Aliases one domain to another. SubDNS uses CNAME as the **default record type** because most users point subdomains to hosting platforms like Vercel, Netlify, or GitHub Pages.

**How it works:** When someone visits `myapp.m2hio.in`, the DNS resolver follows the CNAME to `myapp.vercel.app` and then resolves that domain's IP address.

```text
myapp       IN  CNAME   myapp.vercel.app
```

**Important rules:**
- A CNAME cannot coexist with other record types at the same name.
- Do not use a CNAME for the root domain (naked domain) — SubDNS handles this automatically.

---

## TXT Record (Text)

Stores arbitrary text data. Initially designed for human-readable notes, TXT records are now essential for **domain verification and email security**.

### Common TXT Record Uses

| Purpose | Example Value |
|---------|---------------|
| SPF (email sender policy) | `v=spf1 include:_spf.google.com ~all` |
| DKIM (email signing) | `v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb...` |
| DMARC (email authentication) | `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com` |
| Domain verification (Google, etc.) | `google-site-verification=...` |

```bash
# Add an SPF record via CLI
subdns dns add my-subdomain --type TXT --content "v=spf1 include:_spf.google.com ~all"
```

**Why this matters:** Without SPF, DKIM, and DMARC records, email sent from your subdomain is likely to land in spam folders or be rejected outright.

---

## MX Record (Mail Exchange)

Routes email to a mail server. MX records include a **priority** value — lower numbers take precedence.

```text
example     IN  MX   10  aspmx.l.google.com
example     IN  MX   20  alt1.aspmx.l.google.com
```

**Priorty explained:** If the server at priority 10 is unreachable, mail is delivered to priority 20, and so on. Standard practice is to use gaps of 10 between priorities so you can insert new servers later.

**Setting up email:** After adding MX records, you also need:
- A **TXT record** for SPF
- A **TXT record** for DKIM (provided by your email service)
- A **TXT record** for DMARC

---

## SRV Record (Service)

Defines the location of a specific service (protocol + port). Used by modern communication protocols.

```text
_sip._tcp.example.com  IN  SRV  1  10  5060  sip.example.com
^service ^protocol                ^priority ^port  ^target
```

**Format breakdown:**
- **Service**: `_sip`, `_xmpp`, `_ldap`
- **Protocol**: `_tcp` or `_udp`
- **Priority**: Lower value = higher preference
- **Weight**: Distributes load among equal-priority targets
- **Port**: The port number for the service
- **Target**: The hostname providing the service

---

## CAA Record (Certification Authority Authorization)

Restricts which Certificate Authorities (CAs) can issue SSL/TLS certificates for your domain.

```text
example     IN  CAA   0   issue   "letsencrypt.org"
example     IN  CAA   0   iodef   "mailto:security@example.com"
```

**Why use CAA?** It prevents rogue or unauthorized CAs from issuing certificates for your domain. Only the specified CA (e.g., Let's Encrypt) can issue certificates. The `iodef` property sends violation reports to your email.

---

## NS Record (Nameserver)

Delegates a subdomain to a different set of nameservers. SubDNS manages NS records automatically for your subdomains.

---

## Record Type Comparison

| Record | Function | Example Use Case | Proxy Support |
|--------|----------|------------------|---------------|
| A | IPv4 address | VPS, dedicated server | ✅ |
| AAAA | IPv6 address | Dual-stack hosting | ✅ |
| CNAME | Alias to domain | Vercel, Netlify, GitHub Pages | ✅ |
| TXT | Text data | SPF, DKIM, DMARC, verification | ❌ |
| MX | Email routing | Google Workspace, Cloudflare Email | ❌ |
| SRV | Service location | SIP, XMPP, LDAP | ❌ |
| CAA | CA restriction | Security hardening | ❌ |
| NS | Nameserver delegation | Advanced DNS setups | ❌ |

---

## Choosing the Right Record

1. **Hosting a website on Vercel/Netlify?** → CNAME (default)
2. **Running your own server?** → A record (or AAAA for IPv6)
3. **Setting up email?** → MX + TXT (SPF, DKIM, DMARC)
4. **Hardening security?** → CAA record
5. **Running a custom service?** → SRV record

---

## Need More Help?

- [CLI Guide](./cli-guide.md) — Manage records from the terminal
- [DNS Management](./dns-management.md) — Dashboard walkthrough
- [Troubleshooting DNS](./troubleshooting-dns-issues.md) — Fix common issues
