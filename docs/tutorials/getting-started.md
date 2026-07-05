# Getting Started with SubDNS

SubDNS gives you free subdomains under `m2hio.in` — no credit card, no hassle. Here's how it works.

## How SubDNS Works (The Two-Step Model)

```
YOU (SubDNS user)            SubDNS Platform              Your Hosting Provider
      |                            |                              |
      |  1. Claim a subdomain      |                              |
      |  (e.g. "pvchat")          |                              |
      |--------------------------->|                              |
      |                            |  2. Creates DNS records       |
      |                            |  in Cloudflare automatically  |
      |                            |                              |
      |  3. Add subdomain to       |                              |
      |     your hosting provider  |                              |
      |     (Vercel / Netlify etc) |                              |
      |---------------------------------------------------------->|
      |                            |                              |
      |  4. Done! Your subdomain   |                              |
      |     is live 🎉            |                              |
```

**Key insight:** SubDNS handles the DNS (what Cloudflare needs). YOU handle registering the domain on your hosting provider (Vercel, Netlify, Railway, etc.).

---

## Step 1: Create an Account

1. Go to [https://subdns.m2hio.in](https://subdns.m2hio.in)
2. Click **Get Started** or **Sign Up**
3. Create your account with email and password
4. Verify your email if prompted

---

## Step 2: Claim a Subdomain

1. Log in to your dashboard
2. Click **New Subdomain**
3. Choose your name (e.g. `pvchat`)
4. Set the target (e.g. `prince-v-chat.vercel.app`)
5. Select record type (usually `CNAME`)
6. Click **Create**

SubDNS will automatically create the DNS record in Cloudflare. You don't need Cloudflare access.

---

## Step 3: Connect to Your Hosting Provider

### For Vercel

1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to **Settings → Domains**
3. Enter `pvchat.m2hio.in`
4. Click **Add**
5. Vercel will detect the CNAME record automatically

### For Netlify

1. Go to your site on [netlify.com](https://netlify.com)
2. Navigate to **Site Settings → Domain Management → Custom Domains**
3. Click **Add Custom Domain**
4. Enter `pvchat.m2hio.in`
5. Netlify will detect the existing DNS record

### For Railway

1. Go to your project on [railway.app](https://railway.app)
2. Navigate to **Settings → Custom Domains**
3. Click **Add Custom Domain**
4. Enter `pvchat.m2hio.in`

### For GitHub Pages

1. Go to your repository **Settings → Pages**
2. Under "Custom domain", enter `pvchat.m2hio.in`
3. Click **Save**
4. Check "Enforce HTTPS" after propagation

### For Cloudflare Pages

1. Go to your project on [pages.cloudflare.com](https://pages.cloudflare.com)
2. Navigate to **Custom domains → Set up custom domain**
3. Enter `pvchat.m2hio.in`
4. Cloudflare will detect the DNS automatically

### For Fly.io

1. Run: `flyctl certs create pvchat.m2hio.in`
2. Fly will issue an SSL certificate automatically

### For Koyeb

1. Go to your App → **Settings → Domains**
2. Click **Add Domain**
3. Enter `pvchat.m2hio.in`

---

## Step 4: Verify & Use

- Propagation takes **30 seconds to 5 minutes** (Cloudflare is fast)
- SSL certificates are issued automatically via Cloudflare
- Visit `https://pvchat.m2hio.in` in your browser

---

## Troubleshooting

### 404 / Site Not Found

**Cause:** You added the DNS record but didn't register the domain on your hosting provider.

**Fix:** Go to your Vercel/Netlify/Railway settings and add `pvchat.m2hio.in` as a custom domain.

### DNS Not Propagating

Use a DNS checker like [whatsmydns.net](https://whatsmydns.net) to check if `pvchat.m2hio.in` resolves correctly.

### SSL Issues

Cloudflare issues SSL certificates automatically. If you see "Not Secure":
- Wait a few minutes for Cloudflare to provision the cert
- Make sure Cloudflare proxy (orange cloud) is enabled in your subdomain settings

---

## Next Steps

- [CLI Guide](./cli-guide.md) — Manage subdomains from the terminal
- [DNS Management](./dns-management.md) — Add custom DNS records
- [Platform Guide](./platform-guide.md) — Detailed platform-specific walkthroughs
