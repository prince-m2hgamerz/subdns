# What to Build on Your Subdomain

A free subdomain from SubDNS gives you a clean, professional URL for any project. Here are the most popular use cases with setup guides for each.

---

## 1. Personal Portfolio

Showcase your work with a professional URL like `portfolio.m2hio.in`.

**Best platforms:**
- **Vercel** — Free, great for Next.js portfolios
- **GitHub Pages** — Free, perfect for static sites
- **Netlify** — Free, excellent form handling

**Setup:**
```bash
# Using SubDNS CLI
subdns create portfolio
subdns dns add portfolio --type CNAME --content your-username.github.io

# Or in the dashboard:
# 1. Create a subdomain called "portfolio"
# 2. Add a CNAME record pointing to your GitPages/Netlify URL
# 3. Enable Cloudflare proxy for HTTPS
```

**Pro tip:** Use a custom domain in your GitHub Pages or Netlify settings so they accept traffic from `portfolio.m2hio.in`.

---

## 2. Web Application

Deploy your SaaS, tool, or web app to its own subdomain.

**Best platforms:**
- **Vercel** — Next.js, static sites, serverless functions
- **Railway** — Full-stack apps, Docker containers
- **Fly.io** — Containerized apps with global deployment
- **Koyeb** — Docker-based hosting with auto-scaling

**Example:**
```bash
subdns create myapp
subdns dns add myapp --type CNAME --content myapp.railway.app
```

**Why use a subdomain?** Instead of `myapp.railway.app`, you get `myapp.m2hio.in` — cleaner, more professional, and you maintain portability if you switch hosting providers.

---

## 3. API Endpoint

Expose your backend API on a dedicated subdomain.

**Example:**
```text
api.m2hio.in → Your API server (port 443)
```

**Setup options:**
- **CNAME** — For platforms that provide a domain (Render, Railway)
- **A Record** — For a VPS with a static IP
- **Cloudflare proxy** — For DDoS protection and caching

**Pro tip:** Use separate subdomains for different environments:

```text
api.m2hio.in       → Production API
staging-api.m2hio.in  → Staging environment
dev-api.m2hio.in      → Development
```

---

## 4. Email Server

Set up professional email for your project.

**Required records:**
```text
mail.m2hio.in     A      → Your mail server IP
m2hio.in          MX 10  → mail.m2hio.in
m2hio.in          TXT     → "v=spf1 mx ~all" (SPF)
```

**Popular email providers:**
- **Google Workspace** — $6/user/month, full Gmail experience
- **Cloudflare Email Routing** — Free, forwards to any address
- **Proton Mail** — Encrypted, privacy-focused
- **Zoho Mail** — Free tier available

**IMPORTANT:** MX records must use DNS-only (gray cloud). Cloudflare proxy does not support email traffic.

---

## 5. Status Page

Keep users informed about your service status.

**Best platforms:**
- **Better Uptime** — Free status pages
- **Instatus** — Beautiful status pages with free tier
- **Open Source** — Use Upptime (GitHub-based)

```bash
subdns create status
subdns dns add status --type CNAME --content your-username.betteruptime.com
```

---

## 6. Documentation

Host documentation for your project.

**Best platforms:**
- **Vercel** — Deploy Docsaurus, Nextra, or VitePress
- **GitHub Pages** — Simple Jekyll or MkDocs sites
- **Read the Docs** — Auto-builds from your repo

```bash
subdns create docs
subdns dns add docs --type CNAME --content docs-your-username.vercel.app
```

---

## 7. Staging / Preview Environments

Test changes before they go live.

```bash
subdns create staging
subdns dns add staging --type CNAME --content staging-myapp.vercel.app
```

**CI/CD integration:** Automate subdomain creation in your deployment pipeline:

```bash
# Deploy preview script
subdns dns add preview-${PR_NUMBER} --type CNAME --content preview-${PR_NUMBER}.vercel.app
```

---

## 8. Redirects

Use your subdomain as a short, memorable redirect URL.

**Setup:** Create a CNAME or A record pointing to a redirect service or your own server with rewrite rules.

```text
shop.m2hio.in    → store.example.com
blog.m2hio.in    → your-username.hashnode.dev
links.m2hio.in   → bio.link/your-profile
```

**Pro tip:** Use a Netlify site with a `_redirects` file for zero-code redirect management:

```text
# _redirects file
/*    https://your-target.com/:splat    301!
```

---

## 9. Analytics or Monitoring

Host your analytics dashboard or monitoring tools.

**Example:**
- **Plausible** — Self-hosted analytics on your own subdomain
- **Umami** — Lightweight analytics
- **Grafana** — Monitoring dashboards

```bash
subdns create analytics
subdns dns add analytics --type A --content YOUR_SERVER_IP
```

---

## 10. Development Sandbox

Experiment with new frameworks, tools, or ideas.

```bash
subdns create experiment-deno  # Try Deno
subdns create learn-svelte     # Build a Svelte app
subdns create rust-api         # Experiment with Rust
```

The subdomain stays even if the project is temporary. When you are done, either update the target or delete the subdomain.

---

## Use Case Comparison

| Use Case | Recommended Record | Proxy | Difficulty |
|----------|-------------------|-------|------------|
| Portfolio | CNAME → GitHub/Netlify | ✅ On | Easy |
| Web App | CNAME → Vercel/Railway | ✅ On | Easy |
| API | A or CNAME | ✅ On | Medium |
| Email | MX + TXT | ❌ Off | Medium |
| Status Page | CNAME → provider | ✅ On | Easy |
| Docs | CNAME → host | ✅ On | Easy |
| Staging | CNAME → host | ✅ On | Medium |
| Redirect | A or CNAME | ✅ On | Easy |

---

## Get Started

Pick a use case and create your first subdomain:

- [Getting Started Guide](./getting-started.md) — First subdomain in 2 minutes
- [DNS Management](./dns-management.md) — Managing records in the dashboard
- [CLI Guide](./cli-guide.md) — Creating subdomains from the terminal
