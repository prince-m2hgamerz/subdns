# Platform Integration Guide

Detailed walkthroughs for connecting SubDNS subdomains to popular hosting platforms.

---

## Vercel

### Adding a Custom Domain

1. Open your project dashboard on [vercel.com](https://vercel.com)
2. Go to **Settings** (gear icon) → **Domains**
3. In the input field, type `your-subdomain.m2hio.in`
4. Click **Add**

![Vercel Domains Settings]

5. Vercel will show: *"Domain `your-subdomain.m2hio.in` has been added"*
6. Wait ~30 seconds for SSL provisioning

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Domain not configured" | DNS record hasn't propagated yet — wait 1-2 minutes |
| "Invalid configuration" | Make sure you selected CNAME in your subdomain settings |
| SSL pending | Vercel provisions certs automatically — it may take up to a minute |

---

## Netlify

### Adding a Custom Domain

1. Open your site on [netlify.com](https://netlify.com)
2. Go to **Site Settings → Domain Management → Custom Domains**
3. Click **Add Custom Domain**
4. Enter `your-subdomain.m2hio.in`
5. Click **Verify**
6. Netlify will detect the existing DNS record automatically
7. Click **Add Domain**

### Netlify DNS Check

Netlify will show a DNS check result:
- ✅ **"Netlify has detected the existing DNS records"** — you're good
- ⏳ **"Waiting for DNS propagation"** — wait and refresh
- ❌ **"No DNS records found"** — verify your subdomain exists on SubDNS

---

## Railway

### Adding a Custom Domain

1. Go to your project on [railway.app](https://railway.app)
2. Click **Settings** (in the top right)
3. Scroll to **Custom Domains**
4. Click **Add Custom Domain**
5. Enter `your-subdomain.m2hio.in`
6. Click **Save**

Railway will automatically issue an SSL certificate.

---

## GitHub Pages

### Adding a Custom Domain

1. Go to your repository on GitHub
2. Navigate to **Settings → Pages**
3. Under **Custom domain**, enter `your-subdomain.m2hio.in`
4. Click **Save**
5. ✅ Check **"Enforce HTTPS"** once the domain is verified

### DNS Type

Your subdomain must be a **CNAME** record pointing to `your-username.github.io` (or your custom GitHub Pages domain).

---

## Cloudflare Pages

### Adding a Custom Domain

1. Go to your project on [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. Click your project
3. Go to **Custom domains**
4. Click **Set up custom domain**
5. Enter `your-subdomain.m2hio.in`
6. Click **Continue** → **Activate Domain**

Since SubDNS uses Cloudflare internally, detection is instant.

---

## Fly.io

### CLI Method

```bash
flyctl certs create your-subdomain.m2hio.in
```

### Dashboard Method

1. Go to your app on [fly.io](https://fly.io)
2. Navigate to **Certificates**
3. Click **Add Certificate**
4. Enter `your-subdomain.m2hio.in`

---

## Koyeb

### Adding a Custom Domain

1. Go to your App → **Settings** tab
2. Scroll to **Domains**
3. Click **Add Domain**
4. Enter `your-subdomain.m2hio.in`
5. Click **Save**

---

## Render

### Adding a Custom Domain

1. Go to your service on [render.com](https://render.com)
2. Navigate to **Settings → Custom Domain**
3. Click **Add Custom Domain**
4. Enter `your-subdomain.m2hio.in`
5. Click **Save Changes**

Render will verify the DNS record and issue an SSL certificate.

---

## Heroku

### Adding a Custom Domain

```bash
heroku domains:add your-subdomain.m2hio.in --app your-app-name
```

Heroku requires a DNS target in the form `your-app-name.herokuapp.com`.

---

## General Checklist

Before contacting support, verify:

- [ ] The subdomain exists in your SubDNS dashboard
- [ ] The DNS record type matches what your platform needs (usually CNAME)
- [ ] You added the domain to your hosting provider's settings
- [ ] DNS propagation has had 1-5 minutes
- [ ] SSL is enabled (Cloudflare proxy = orange cloud)
