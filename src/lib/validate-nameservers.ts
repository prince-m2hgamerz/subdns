const FQDN_REGEX = /^(?=.{1,253}$)(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)\.)+[a-zA-Z]{2,}$/;

const BLOCKED_PATTERNS = [
  { pattern: /\.cloudflare\.com$/i, label: "Cloudflare" },
  { pattern: /foundationdns/i, label: "Foundation DNS" },
];

export type NameserverValidationResult =
  | { ok: true; nameservers: string[] }
  | { ok: false; error: string };

export function validateNameservers(raw: unknown): NameserverValidationResult {
  if (!Array.isArray(raw)) {
    return { ok: false, error: "Nameservers must be provided as an array" };
  }

  const sanitized = raw
    .filter((ns) => typeof ns === "string" && ns.trim().length > 0)
    .map((ns) => ns.trim().toLowerCase());

  if (sanitized.length < 2) {
    return { ok: false, error: "At least 2 nameservers are required for delegated mode" };
  }

  if (sanitized.length > 4) {
    return { ok: false, error: "Maximum 4 nameservers allowed" };
  }

  for (const ns of sanitized) {
    if (!FQDN_REGEX.test(ns)) {
      return {
        ok: false,
        error: `"${ns}" is not a valid fully qualified domain name. Use format: ns1.example.com`,
      };
    }

    for (const { pattern, label } of BLOCKED_PATTERNS) {
      if (pattern.test(ns)) {
        return {
          ok: false,
          error: `"${ns}" is not allowed. ${label} nameservers cannot be used for delegated subdomains`,
        };
      }
    }
  }

  const unique = new Set(sanitized);
  if (unique.size !== sanitized.length) {
    return { ok: false, error: "Duplicate nameservers are not allowed" };
  }

  return { ok: true, nameservers: sanitized };
}
