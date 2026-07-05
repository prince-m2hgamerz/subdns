# CLI Guide

SubDNS has a command-line tool for managing subdomains without the web dashboard.

---

## Installation

```bash
# Using npm (recommended)
npm install -g @subdns/cli

# Using yarn
yarn global add @subdns/cli

# Using bun
bun install -g @subdns/cli
```

---

## Authentication

```bash
# Log in with your API key
subdns login subdns_abc123...

# The key is stored locally in ~/.config/subdns/config.json
```

Get your API key from your SubDNS dashboard → **API Keys**.

---

## Quick Start

```bash
# Claim a subdomain
subdns claim pvchat --target myapp.vercel.app

# List your subdomains
subdns list

# Check a subdomain details
subdns info pvchat

# Release a subdomain (delete it)
subdns release pvchat
```

---

## Commands

### `subdns claim <name>`

Create a new subdomain.

| Option | Alias | Default | Description |
|--------|-------|---------|-------------|
| `--target` | `-t` | — | Target URL/IP (required) |
| `--type` | — | `CNAME` | Record type: `A`, `AAAA`, `CNAME` |
| `--proxied` | `-p` | `true` | Enable Cloudflare proxy |
| `--ttl` | — | `1` (Auto) | TTL in seconds |

**Examples:**
```bash
subdns claim myapp --target myapp.vercel.app
subdns claim api --target 203.0.113.10 --type A --proxied false
```

### `subdns list`

List all your subdomains with their status.

```bash
subdns list
```

### `subdns info <name>`

Show detailed information about a subdomain including all DNS records.

```bash
subdns info myapp
```

### `subdns release <name>`

Delete a subdomain and all its DNS records.

```bash
subdns release old-project
```

### `subdns dns add <name>`

Add a DNS record to an existing subdomain.

| Option | Alias | Description |
|--------|-------|-------------|
| `--type` | — | Record type: `A`, `AAAA`, `CNAME`, `TXT`, `MX`, `SRV`, `CAA` |
| `--content` | `-c` | Record content/value |
| `--ttl` | — | TTL in seconds (default: auto) |
| `--proxied` | `-p` | Enable Cloudflare proxy |
| `--priority` | — | Priority (for MX/SRV records) |

**Examples:**
```bash
subdns dns add myapp --type A --content 76.76.21.21
subdns dns add myapp --type TXT --content "v=spf1 include:_spf.google.com ~all"
subdns dns add myapp --type MX --content aspmx.l.google.com --priority 10
```

### `subdns dns rm <id>`

Remove a DNS record by its ID (get ID from `subdns info <name>`).

```bash
subdns dns rm dns_abc123
```

### `subdns logs`

View your recent activity.

| Option | Default | Description |
|--------|---------|-------------|
| `--limit` | `20` | Number of log entries |

```bash
subdns logs --limit 50
```

### `subdns logout`

Remove stored API key.

```bash
subdns logout
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SUBDNS_API_URL` | `https://subdns.m2hio.in` | Override API base URL |

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `2` | Authentication error |
| `3` | Not found |
| `4` | Validation error |

---

## Examples

### Deploy a project end-to-end

```bash
# 1. Claim the subdomain
subdns claim my-portfolio --target portfolio-username.vercel.app

# 2. Add www redirect
subdns dns add my-portfolio --type CNAME --content portfolio-username.vercel.app

# 3. Verify
subdns info my-portfolio

# 4. Done! Add my-portfolio.m2hio.in to Vercel settings
```

### Host a mail server

```bash
# Claim subdomain
subdns claim mail --target 203.0.113.50 --type A --proxied false

# Add MX records
subdns dns add mail --type MX --content mail.example.com --priority 10 --proxied false

# Add SPF record
subdns dns add mail --type TXT --content "v=spf1 mx ~all"

# Add DKIM record
subdns dns add mail --type TXT --content "v=DKIM1; k=rsa; p=MIGfMA0GCSq..."
```

### API endpoint

```bash
subdns claim api --target fly-app.fly.dev
```
