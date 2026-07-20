# DNSSEC Explained: Securing the DNS Chain

Every time you type a domain into your browser, DNS lookups pass through multiple servers before returning the correct IP address. What if one of those servers returned a fake result? DNSSEC prevents exactly this attack.

---

## The Problem: DNS Cache Poisoning

Without DNSSEC, DNS responses are **not verified**. A malicious actor could intercept a DNS query and return a fake IP address, redirecting traffic to a phishing site or their own server.

This attack, called **DNS cache poisoning** or **DNS spoofing**, has been used in major security breaches. The user types `bank.com` and their browser goes to an attacker's server — all without a certificate warning.

---

## How DNSSEC Solves This

DNSSEC adds **digital signatures** to DNS records. These signatures allow DNS resolvers to verify that the response came from the authoritative nameserver and has not been tampered with.

```
Without DNSSEC:
  Query → ??? → Fake IP (invisible to user)

With DNSSEC:
  Query → Signed Response → Verify Signature → Real IP
                                        ↓
                              Tampered Response → Rejected
```

### The Chain of Trust

DNSSEC builds a hierarchical chain of trust starting from the root zone:

1. **Root zone** signs the `.com` key
2. **`.com` zone** signs the `m2hio.in` key
3. **`m2hio.in` zone** signs your subdomain records

Each level validates the level below it, creating an unbroken chain of cryptographic trust.

### Key Components

| Component | What It Does |
|-----------|-------------|
| **RRSIG** (Resource Record Signature) | Contains the digital signature for each DNS record set |
| **DNSKEY** (DNS Public Key) | The public key used to verify signatures |
| **DS** (Delegation Signer) | Links the parent zone to the child zone's key |
| **NSEC/NSEC3** (Next Secure) | Proves that a record does not exist (denial of existence) |

---

## How SubDNS Handles DNSSEC

SubDNS automatically manages DNSSEC for your subdomains. When DNSSEC is enabled on the parent zone (as it is for m2hio.in):

1. SubDNS automatically signs all DNS records for your subdomain
2. The signatures (RRSIG records) are automatically refreshed before they expire
3. You do not need to install or manage any cryptographic keys

**What you need to do:** Nothing. DNSSEC is handled transparently. If you see a green DNSSEC indicator in your DNS checker, verification is working correctly.

---

## Verifying DNSSEC Status

### Using dig

```bash
# Check if DNSSEC is working (look for "ad" flag — authenticated data)
dig +dnssec your-subdomain.m2hio.in

# Inspect the RRSIG records
dig +dnssec your-subdomain.m2hio.in | grep "RRSIG"

# Verify the chain of trust
delv +vtrace your-subdomain.m2hio.in
```

### Online DNSSEC Checkers

- **dnsviz.net** — Visual DNSSEC diagnostic tool
- **dnssec-analyzer.verisignlabs.com** — Detailed DNSSEC analysis
- **DNSSEC Resolver Test** at `isbgpsafeyet.com`

### Browser Indicators

Major browsers do not show DNSSEC status directly, but they benefit from it. If DNSSEC validation fails, some resolvers will return SERVFAIL, causing the site to not load — which is the correct behavior: better to fail than serve tampered data.

---

## Common DNSSEC Issues

### SERVFAIL Errors

If DNSSEC validation fails, resolvers return SERVFAIL. This can happen when:

| Cause | Solution |
|-------|----------|
| Signature expired | SubDNS auto-refreshes; wait 1-2 minutes |
| Clock skew on resolver | Resolver issue, not your problem |
| Inconsistent DS records | Contact SubDNS support |
| Propagation delay | Wait for TTL + 5 minutes |

### DS Record Mismatch

If the DS record in the parent zone does not match the DNSKEY in your zone, validation fails. SubDNS handles this automatically — you should not encounter this error.

---

## DNSSEC vs. SSL/TLS

These are complementary technologies that solve different problems:

| | DNSSEC | SSL/TLS |
|--|--------|---------|
| **What it verifies** | The DNS response is authentic | The web server is who it claims to be |
| **Protects against** | DNS spoofing, cache poisoning | Man-in-the-middle attacks |
| **Works at** | DNS layer | Application layer (HTTP) |
| **User visible?** | No (background) | Yes (padlock icon) |
| **SubDNS manages** | ✅ Automatically | Via Cloudflare proxy |

Both should be used together for maximum security.

---

## DNSSEC Best Practices

1. **Keep it enabled** — There is no downside to DNSSEC when SubDNS manages it automatically
2. **Monitor with dnsviz.net** — Run periodic checks to ensure the chain of trust is intact
3. **Check after zone changes** — After major DNS changes, verify signatures are still valid
4. **Use validated resolvers** — Google DNS (8.8.8.8), Cloudflare (1.1.1.1), and Quad9 (9.9.9.9) all perform DNSSEC validation

---

## DNS Security Comparison

| Feature | DNSSEC | Cloudflare Proxy | SSL Certificate |
|---------|--------|------------------|-----------------|
| Encrypts traffic? | No | Yes | Yes |
| Prevents spoofing? | ✅ Yes | ❌ No | ❌ No |
| Hides origin IP? | No | ✅ Yes | No |
| SubDNS default? | ✅ Enabled | Optional | Via proxy |

---

## Related Guides

- [DNS Record Types](./dns-record-types-deep-dive.md) — Understanding all record types
- [Cloudflare Proxy Guide](./cloudflare-proxy-ssl-guide.md) — SSL and proxy features
- [How SubDNS Works](./how-subdns-works.md) — Platform architecture
