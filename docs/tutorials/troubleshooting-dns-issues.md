# Troubleshooting DNS Issues

DNS problems can be frustrating. Your record looks right in the dashboard, but the website is not loading, email is bouncing, or you are getting SSL errors. This guide walks through the most common issues and how to fix them.

---

## Quick Diagnostic Checklist

Before diving deep, check these three things:

- [ ] **Has the TTL expired?** If you just created or updated the record, wait the full TTL duration
- [ ] **Is the record correct?** Double-check the target value in the dashboard
- [ ] **Is Cloudflare proxy on/off correctly?** Some services require DNS-only (gray cloud)

---

## Problem: Website Not Loading

### Possible Cause 1: Propagation Delay

If you just created the subdomain, DNS propagation can take minutes to hours.

**Check:** Use `whatsmydns.net` to see global propagation status.

**Fix:** Wait for the TTL to expire. Reduce TTL to 300 before your next change so propagation is faster.

### Possible Cause 2: Wrong Record Type

You deployed to Vercel and added an A record instead of a CNAME. Vercel provides a target domain like `myapp.vercel.app`, but your A record points to a different IP.

**Check:** Verify your hosting platform's documentation for the correct record type and target.

**Fix:** Delete the incorrect record and create a CNAME record pointing to the target provided by your host.

### Possible Cause 3: Cloudflare Proxy Issue

Some platforms do not work correctly behind Cloudflare's proxy.

**Check:** Disable the proxy (switch to gray cloud) and test again.

**Fix:** If it works with proxy off, the issue is with Cloudflare proxying. Refer to the [Cloudflare Proxy Guide](./cloudflare-proxy-ssl-guide.md) for platform-specific instructions.

### Possible Cause 4: Blank Page or 404

The DNS is working, but your hosting platform is not configured to accept traffic for this domain.

**Check:** Check your hosting platform's custom domain settings. You may need to add `your-subdomain.m2hio.in` to your project.

**Fix:** Add the custom domain in your hosting platform (Vercel, Netlify, etc.) and set the DNS target they provide.

---

## Problem: SSL Certificate Error

### Cause: Certificate Not Yet Issued

Cloudflare needs time to provision an SSL certificate for your subdomain.

**Check:** Wait 1-2 minutes and refresh.

**Fix:** If it takes longer than 5 minutes, try disabling and re-enabling the proxy toggle.

### Cause: "Full (strict)" Without Origin SSL

Cloudflare's default SSL mode requires your origin server to have a valid SSL certificate. If your origin only serves HTTP, you will see an SSL error.

**Check:** Visit your origin directly to see if it supports HTTPS.

**Fix:** Either enable HTTPS on your origin, or (not recommended) change the SSL mode to Flexible in the Cloudflare dashboard.

### Cause: Self-Signed Certificate

If your origin uses a self-signed certificate, Cloudflare's Full (strict) mode will reject it.

**Fix:** Use a valid certificate from Let's Encrypt (free) or switch to Full (non-strict) mode.

---

## Problem: Email Not Delivered

### Cause: Missing SPF Record

Without an SPF record, receiving servers may reject or spam-filter email from your subdomain.

**Check:** Look for a TXT record starting with `v=spf1`.

**Fix:** Add an SPF record. For Google Workspace:

```bash
subdns dns add my-subdomain --type TXT --content "v=spf1 include:_spf.google.com ~all"
```

### Cause: Missing DKIM Record

**Check:** Verify the DKIM record provided by your email service is present.

**Fix:** Follow your email provider's DKIM setup instructions and add the generated TXT record in SubDNS.

### Cause: Missing DMARC Record

Without DMARC, you have no visibility into email authentication failures.

**Fix:** Add a DMARC policy record:

```text
_dmarc.your-subdomain  TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

### Cause: Proxied MX Records

MX records cannot be proxied through Cloudflare. If your MX record has the proxy enabled (orange cloud), email will fail.

**Fix:** Change the MX record to DNS only (gray cloud) in the dashboard.

---

## Problem: "Too Many Redirects" Error

### Cause: HTTPS Redirect Loop

Cloudflare tries to connect via HTTPS, your origin redirects HTTP to HTTPS, and they end up in a loop.

**Fix:** In the Cloudflare dashboard, set SSL to **Full (strict)** and make sure your origin does not redirect to HTTPS — let Cloudflare handle the encryption.

---

## Problem: Subdomain Works Intermittently

### Cause: Mixed Propagation

Some visitors go through a resolver that has cached the old IP, while others use a resolver with the new IP.

**Check:** Use `www.whatsmydns.net` to see propagation status across regions.

**Fix:** This is normal and will resolve once the TTL expires on all resolvers.

---

## Diagnostic Commands

### Windows

```batch
:: Check DNS resolution
nslookup your-subdomain.m2hio.in

:: Check with specific resolver
nslookup your-subdomain.m2hio.in 8.8.8.8

:: Clear local DNS cache
ipconfig /flushdns

:: Trace the route
tracert your-subdomain.m2hio.in
```

### macOS / Linux

```bash
# Check DNS resolution
dig your-subdomain.m2hio.in

# Check with Cloudflare's resolver
dig @1.1.1.1 your-subdomain.m2hio.in

# Trace the full DNS path
dig your-subdomain.m2hio.in +trace

# Check HTTP headers
curl -vI https://your-subdomain.m2hio.in 2>&1

# Check DNSSEC status
dig +dnssec your-subdomain.m2hio.in

# Verify mail server
dig your-subdomain.m2hio.in MX

# Clear OS cache (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

---

## When to Contact Support

If you have tried the above steps and still have issues, contact SubDNS support with:

1. The exact subdomain name
2. What you are trying to do (website, email, API, etc.)
3. What error message you see (screenshot if possible)
4. The output of `dig your-subdomain.m2hio.in`
5. When the record was last updated

---

## Prevention Tips

1. **Lower TTL before changes** — Set TTL to 300 a day before making important changes
2. **Test with dig first** — Verify DNS resolves correctly before pointing a live service
3. **Keep records clean** — Remove unused records to avoid configuration conflicts
4. **Use automation** — SubDNS CLI can manage records via scripts for consistent setup
5. **Document changes** — Keep a log of what you changed and when

---

## Related Guides

- [DNS Propagation & TTL](./dns-propagation-ttl.md) — Understanding propagation delays
- [Cloudflare Proxy Guide](./cloudflare-proxy-ssl-guide.md) — SSL and proxy troubleshooting
- [DNS Record Types](./dns-record-types-deep-dive.md) — Choosing the right record
- [CLI Guide](./cli-guide.md) — Managing records from the terminal
