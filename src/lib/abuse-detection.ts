import { supabase } from "./supabase";

export interface AbuseResult {
  score: number;
  signals: AbuseSignal[];
  verdict: "allow" | "review_async" | "review_sync" | "block";
}

export interface AbuseSignal {
  name: string;
  points: number;
  detail: string;
}

const PHISHING_KEYWORDS = [
  "login", "signin", "verify", "account", "secure", "authenticate",
  "banking", "wallet", "password", "credential", "update-payment",
  "confirm-identity", "2fa", "two-factor", "recovery", "support-",
  "helpdesk", "admin-", "webmail", "outlook-", "office365",
  "dropbox", "google-", "apple-", "paypal", "amazon-", "netflix",
  "steam-", "discord-", "github-", "telegram-", "whatsapp-",
  "free-", "claim-", "win-", "prize", "reward", "bonus",
  "crypto-", "bitcoin", "eth-", "token-", "airdrop", "nft-",
  "metamask", "trust-", "defi-", "swap-", "bridge-",
];

const HOMOGLYPH_MAP: Record<string, string[]> = {
  "a": ["а", "à", "á", "â", "ã", "ä", "å", "ɑ"],
  "c": ["с", "ç", "č"],
  "e": ["е", "è", "é", "ê", "ë", "ě"],
  "i": ["і", "ì", "í", "î", "ï"],
  "o": ["о", "ò", "ó", "ô", "õ", "ö", "ø"],
  "u": ["и", "ù", "ú", "û", "ü"],
  "y": ["у", "ÿ"],
  "p": ["р"],
  "s": ["ѕ"],
  "x": ["х"],
  "b": ["ь", "ъ"],
  "k": ["к"],
  "m": ["м"],
  "t": ["т"],
  "h": ["н"],
};

const KNOWN_MALICIOUS_IPS = new Set<string>([]);

const SUSPICIOUS_TLDS = new Set([".tk", ".ml", ".ga", ".cf", ".gq"]);

function domainEntropy(name: string): number {
  const len = name.length;
  if (len === 0) return 0;
  const freq: Record<string, number> = {};
  for (const ch of name.toLowerCase()) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  let entropy = 0;
  for (const ch of Object.keys(freq)) {
    const p = freq[ch] / len;
    entropy -= p * (Math.log2(p));
  }
  return entropy;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function hasHomoglyphs(name: string): boolean {
  for (const ch of name) {
    for (const latin of Object.keys(HOMOGLYPH_MAP)) {
      if (HOMOGLYPH_MAP[latin].includes(ch)) return true;
    }
  }
  return false;
}

function isMixedScript(name: string): boolean {
  const scripts = new Set<string>();
  for (const ch of name) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x0400 && code <= 0x04FF) scripts.add("cyrillic");
    else if (code >= 0x0370 && code <= 0x03FF) scripts.add("greek");
    else if (code >= 0x4E00 && code <= 0x9FFF) scripts.add("cjk");
    else if (code >= 0x0600 && code <= 0x06FF) scripts.add("arabic");
    else if (code >= 0xAC00 && code <= 0xD7AF) scripts.add("hangul");
    else if (code >= 0x0E00 && code <= 0x0E7F) scripts.add("thai");
    else if ((code >= 0x0020 && code <= 0x007E) || (code >= 0x00C0 && code <= 0x024F)) scripts.add("latin");
  }
  return scripts.size > 1;
}

export function scoreSubdomainName(
  name: string,
  targetDomain: string,
  targetIp?: string | null,
): AbuseSignal[] {
  const signals: AbuseSignal[] = [];
  const lower = name.toLowerCase();

  for (const kw of PHISHING_KEYWORDS) {
    if (lower.includes(kw)) {
      signals.push({ name: "phishing_keyword", points: 25, detail: `Contains phishing keyword: "${kw}"` });
      break;
    }
  }

  if (lower !== name) {
    signals.push({ name: "mixed_case", points: 5, detail: "Subdomain uses mixed case" });
  }

  if (hasHomoglyphs(lower) || isMixedScript(name)) {
    signals.push({ name: "homoglyph_mixed_script", points: 40, detail: "Contains homoglyph characters or mixed scripts" });
  }

  for (const domain of ["google", "facebook", "amazon", "apple", "microsoft", "netflix",
    "paypal", "instagram", "whatsapp", "twitter", "discord", "telegram",
    "github", "gitlab", "dropbox", "cloudflare", "wordpress", "shopify",
  ]) {
    const dist = levenshtein(lower, domain);
    if (dist <= 2 && dist > 0) {
      signals.push({ name: "typosquatting", points: 40, detail: `Typosquats "${domain}" (Levenshtein: ${dist})` });
      break;
    }
  }

  const entropy = domainEntropy(lower);
  if (entropy > 3.5) {
    signals.push({ name: "high_entropy", points: 20, detail: `High entropy (${entropy.toFixed(2)} bits/char)` });
  }

  if (targetIp && KNOWN_MALICIOUS_IPS.has(targetIp)) {
    signals.push({ name: "malicious_target", points: 25, detail: `DNS target IP is known malicious: ${targetIp}` });
  }

  const targetParts = targetDomain.toLowerCase().split(".");
  for (const tld of SUSPICIOUS_TLDS) {
    if (targetDomain.toLowerCase().endsWith(tld)) {
      signals.push({ name: "suspicious_tld", points: 10, detail: `Target domain uses suspicious TLD: ${tld}` });
      break;
    }
  }

  return signals;
}

export async function checkAbuseVelocity(
  userId: string,
): Promise<AbuseSignal[]> {
  const signals: AbuseSignal[] = [];
  const windowStart = new Date(Date.now() - 3600_000).toISOString();

  const { count: recentCount, error: countError } = await supabase
    .from("subdomains")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", windowStart);

  if (!countError && (recentCount ?? 0) >= 10) {
    signals.push({
      name: "velocity_per_account",
      points: 30,
      detail: `${recentCount} subdomains created in last hour (per-account limit: 10)`,
    });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("created_at")
    .eq("id", userId)
    .single();

  if (userData) {
    const accountAge = Date.now() - new Date(userData.created_at).getTime();
    const accountDays = accountAge / (1000 * 60 * 60 * 24);
    if (accountDays < 7) {
      signals.push({
        name: "new_account",
        points: 10,
        detail: `Account is ${accountDays.toFixed(1)} days old`,
      });
    }
  }

  return signals;
}

export function scoreTargetDomain(targetDomain: string): AbuseSignal[] {
  const signals: AbuseSignal[] = [];
  const lower = targetDomain.toLowerCase();

  const domainBrands = [
    "google", "facebook", "amazon", "apple", "microsoft",
    "netflix", "paypal", "instagram", "whatsapp", "twitter",
    "discord", "telegram", "github", "dropbox", "cloudflare",
  ];
  for (const brand of domainBrands) {
    if (lower.includes(brand)) {
      signals.push({
        name: "brand_in_target",
        points: 15,
        detail: `Target domain "${targetDomain}" contains brand "${brand}"`,
      });
      break;
    }
  }

  return signals;
}

export function computeVerdict(score: number): AbuseResult["verdict"] {
  if (score >= 85) return "block";
  if (score >= 60) return "review_sync";
  if (score >= 30) return "review_async";
  return "allow";
}
