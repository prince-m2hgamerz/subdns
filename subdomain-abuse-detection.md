# Subdomain Creation Abuse Detection

Two layers: a fast heuristic scorer (runs on every request, no external calls) and an LLM
classifier (runs only on requests that land in the "ambiguous" band, since it's slower/costlier).

---

## Layer 1: Heuristic Risk Score (runs synchronously, Cloudflare Worker/KV)

Score each subdomain creation request 0–100. Each signal adds points; total score determines action.

| Signal | Points | Why |
|---|---|---|
| Subdomain matches/contains a reserved or high-value word (`admin`, `api`, `mail`, `login`, `secure`, `verify`, `account`, `support`, `billing`, `paypal`, `bank`) | +25 | Common phishing landing-page names |
| Levenshtein distance ≤ 2 from a top-1000 brand domain (google, microsoft, apple, paypal, amazon, facebook, instagram, whatsapp, netflix, chase, wellsfargo, etc.) | +40 | Typosquatting / brand impersonation |
| Contains homoglyph/mixed-script characters (Cyrillic о vs Latin o, etc.) | +40 | Visual spoofing — normalize with `String.prototype.normalize("NFKC")` and compare against ASCII-only version; if they differ meaningfully, flag |
| High Shannon entropy in the label (> ~3.5 bits/char on a label ≥8 chars) | +20 | Looks like a DGA (malware C2 domain generation) or random spam string, not a human-chosen name |
| Same account created > N subdomains in last 10 minutes (velocity) | +30 | Automation/scripted abuse |
| Same IP created subdomains across multiple different accounts in short window | +35 | Account-farming, evading per-account limits |
| Account is < 1 hour old AND this is its first subdomain AND name matches signals above | +15 | New accounts are the most common abuse vector — combine with other signals rather than blocking new accounts outright |
| Target DNS record (A/CNAME) resolves to an IP on a known-bad reputation list (AbuseIPDB, Cloudflare's own threat intel if available via Worker binding) | +45 | Directly points at known malicious infra |
| Requested subdomain is on your own static blocklist (slurs, extremist terms, previously-abused exact names) | Auto-block (score = 100) | Zero tolerance, no scoring needed |

**Thresholds:**
- **0–29**: Allow immediately.
- **30–59**: Allow, but log and flag for the LLM classifier (Layer 2) to run asynchronously; if Layer 2 confirms high risk, suspend the subdomain retroactively and notify the user.
- **60–84**: Hold — don't activate DNS yet, run Layer 2 synchronously (adds ~1–2s), then decide.
- **85–100**: Auto-block, log for manual review, don't call the LLM (heuristics alone are confident enough — save the API call).

### Starter implementation sketch (Cloudflare Worker, TypeScript)

```typescript
const BRAND_LIST = ["google", "microsoft", "apple", "paypal", "amazon", "facebook",
  "instagram", "whatsapp", "netflix", "chase", "wellsfargo", "gmail", "outlook"];

const PHISHING_KEYWORDS = ["admin", "login", "secure", "verify", "account",
  "support", "billing", "signin", "reset", "update"];

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function shannonEntropy(s: string): number {
  const freq: Record<string, number> = {};
  for (const c of s) freq[c] = (freq[c] || 0) + 1;
  return Object.values(freq).reduce((sum, count) => {
    const p = count / s.length;
    return sum - p * Math.log2(p);
  }, 0);
}

function hasMixedScript(label: string): boolean {
  const normalized = label.normalize("NFKC");
  // crude check: does normalizing change it meaningfully, or does it contain
  // non-ASCII while looking similar to an ASCII brand name
  return /[^\x00-\x7F]/.test(label);
}

export async function scoreSubdomainRequest(params: {
  label: string;
  accountId: string;
  requestIp: string;
  kv: KVNamespace; // for velocity tracking
}): Promise<{ score: number; reasons: string[] }> {
  const { label, accountId, requestIp, kv } = params;
  const lower = label.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  if (PHISHING_KEYWORDS.some((k) => lower.includes(k))) {
    score += 25;
    reasons.push("contains high-risk keyword");
  }

  for (const brand of BRAND_LIST) {
    if (levenshtein(lower, brand) <= 2 && lower !== brand) {
      score += 40;
      reasons.push(`close to brand name "${brand}"`);
      break;
    }
  }

  if (hasMixedScript(label)) {
    score += 40;
    reasons.push("mixed/non-ASCII script detected");
  }

  if (lower.length >= 8 && shannonEntropy(lower) > 3.5) {
    score += 20;
    reasons.push("high entropy, looks machine-generated");
  }

  // Velocity check: how many subdomains has this account created in last 10 min?
  const accountKey = `velocity:account:${accountId}`;
  const accountCount = parseInt((await kv.get(accountKey)) || "0", 10);
  if (accountCount >= 5) {
    score += 30;
    reasons.push("high creation velocity for account");
  }
  await kv.put(accountKey, String(accountCount + 1), { expirationTtl: 600 });

  const ipKey = `velocity:ip:${requestIp}`;
  const ipAccounts = new Set(JSON.parse((await kv.get(ipKey)) || "[]"));
  ipAccounts.add(accountId);
  if (ipAccounts.size >= 3) {
    score += 35;
    reasons.push("multiple accounts from same IP");
  }
  await kv.put(ipKey, JSON.stringify([...ipAccounts]), { expirationTtl: 600 });

  return { score: Math.min(score, 100), reasons };
}
```

---

## Layer 2: LLM Classification Prompt (for the 30–84 ambiguous band)

Use this as the system prompt for a Claude API call (Haiku is enough here — this is a cheap
classification task, don't spend Sonnet/Opus budget on it). Send it the subdomain label and
any available signals from Layer 1.

```
You are a fraud-detection classifier for a subdomain-hosting service. You will be given a
requested subdomain name and heuristic signals already computed about it. Decide whether the
name is likely intended for abuse (phishing, brand impersonation, malware distribution, spam,
scam pages) versus a legitimate personal or project use.

Respond ONLY with a JSON object, no other text:
{
  "risk": "low" | "medium" | "high",
  "category": "none" | "phishing" | "brand_impersonation" | "malware_cc" | "spam" | "hate_or_extremism" | "other",
  "confidence": 0.0-1.0,
  "reasoning": "one short sentence"
}

Guidelines:
- A name resembling a real brand/service (even with minor misspellings, added words like
  "login" or "support", or homoglyphs) combined with intent to deceive is "brand_impersonation"
  or "phishing" — high risk.
- Generic project names, personal names, hobby-project names, or plausible business names are
  low risk even if they happen to overlap with a common word.
- High-entropy/random-looking strings with no evident meaning lean toward "malware_cc" or
  "spam" if combined with rapid creation velocity signals, but a single random-looking name by
  itself (e.g., a generated project codename) is not automatically high risk — use judgment.
- Do not guess at private information about who is requesting this; judge only the name and
  the signals you're given.

Requested subdomain: {{label}}
Full domain would be: {{label}}.m2hio.in
Heuristic signals detected: {{reasons_list}}
Heuristic score: {{score}}/100
Account age: {{account_age_hours}} hours
Subdomains created by this account in last 10 min: {{account_velocity}}
```

### Handling the response

- `risk: "high"` + `confidence > 0.7` → block, log, notify account (or silently hold for
  manual review if you want to avoid tipping off abusers).
- `risk: "medium"` → allow but add to a watchlist; re-check if the same account/IP triggers
  Layer 1 again within 24h.
- `risk: "low"` → allow, no further action.

### A few product-specific notes for SubDNS

- Since `m2hio.in` subdomains are free, expect volume-based abuse (spam/SEO farms, disposable
  phishing infra) more than one-off targeted attacks — weight velocity signals heavily.
- Keep a rolling blocklist of subdomains that were previously taken down for abuse; a repeat
  attempt at the *exact same* name from a *different* account is a strong signal on its own,
  worth an automatic hard flag regardless of score.
- Log every block/flag decision with the full signal breakdown — you'll want this data to
  retune the point values in Layer 1 over time as real abuse patterns emerge on your platform,
  rather than keeping the initial weights fixed forever.
