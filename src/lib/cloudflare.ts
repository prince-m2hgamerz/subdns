const CF_API = "https://api.cloudflare.com/client/v4";

interface CfResponse<T> {
  success: boolean;
  errors: { code: number; message: string }[];
  messages: string[];
  result: T;
}

async function cfFetch<T>(
  path: string,
  options: RequestInit = {},
  zoneId?: string
): Promise<CfResponse<T>> {
  const zone = zoneId || process.env.CLOUDFLARE_ZONE_ID;
  const email = process.env.CLOUDFLARE_API_EMAIL;
  const key = process.env.CLOUDFLARE_API_KEY;

  if (!email || !key || !zone) {
    throw new Error("Cloudflare credentials not configured");
  }

  const url = `${CF_API}${path.startsWith("/") ? "" : "/zones/"}${zone}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "X-Auth-Email": email,
      "X-Auth-Key": key,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(
      `Cloudflare API error: ${data.errors?.[0]?.message || "Unknown error"}`
    );
  }

  return data as CfResponse<T>;
}

export interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
  ttl: number;
  priority?: number;
  created_on: string;
  modified_on: string;
}

export async function createDnsRecord(params: {
  type: string;
  name: string;
  content: string;
  ttl?: number;
  proxied?: boolean;
  priority?: number;
}, zoneId?: string) {
  return cfFetch<DnsRecord>("dns_records", {
    method: "POST",
    body: JSON.stringify(params),
  }, zoneId);
}

export async function updateDnsRecord(
  recordId: string,
  params: {
    type?: string;
    name?: string;
    content?: string;
    ttl?: number;
    proxied?: boolean;
    priority?: number;
  },
  zoneId?: string
) {
  return cfFetch<DnsRecord>(`dns_records/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify(params),
  }, zoneId);
}

export async function deleteDnsRecord(recordId: string, zoneId?: string) {
  return cfFetch<{ id: string }>(`dns_records/${recordId}`, {
    method: "DELETE",
  }, zoneId);
}

export async function listDnsRecords(params?: {
  type?: string;
  name?: string;
  page?: number;
  per_page?: number;
}, zoneId?: string) {
  const query = new URLSearchParams();
  if (params?.type) query.set("type", params.type);
  if (params?.name) query.set("name", params.name);
  if (params?.page) query.set("page", params.page.toString());
  if (params?.per_page) query.set("per_page", params.per_page.toString());

  const qs = query.toString();
  return cfFetch<DnsRecord[]>(`dns_records${qs ? `?${qs}` : ""}`, {}, zoneId);
}

export async function getDnsRecord(recordId: string, zoneId?: string) {
  return cfFetch<DnsRecord>(`dns_records/${recordId}`, {}, zoneId);
}

export async function detectDuplicateRecords(
  type: string,
  name: string,
  content: string,
  zoneId?: string
): Promise<boolean> {
  try {
    const records = await listDnsRecords({ type, name }, zoneId);
    return records.result.some(
      (r) => r.type === type && r.name === name && r.content === content
    );
  } catch {
    return false;
  }
}

export async function checkDnsPropagation(domain: string): Promise<{
  resolved: boolean;
  ips: string[];
  cloudflare: boolean;
}> {
  try {
    const dnsServers = [
      "https://cloudflare-dns.com/dns-query",
      "https://dns.google/resolve",
    ];
    const results: string[] = [];

    for (const server of dnsServers) {
      const url = `${server}?name=${domain}&type=A`;
      const res = await fetch(url, {
        headers: { Accept: "application/dns-json" },
      });
      const data = await res.json();
      if (data.Answer) {
        data.Answer.forEach((a: any) => results.push(a.data));
      }
    }

    const uniqueIps = [...new Set(results)];
    const isCloudflare = uniqueIps.some(
      (ip) =>
        ip.startsWith("104.") ||
        ip.startsWith("172.") ||
        ip.startsWith("173.")
    );

    return {
      resolved: uniqueIps.length > 0,
      ips: uniqueIps,
      cloudflare: isCloudflare,
    };
  } catch {
    return { resolved: false, ips: [], cloudflare: false };
  }
}

export async function validateDnsRecord(
  type: string,
  value: string
): Promise<{ valid: boolean; error?: string }> {
  const patterns: Record<string, RegExp> = {
    A: /^(\d{1,3}\.){3}\d{1,3}$/,
    AAAA: /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/,
    CNAME: /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    TXT: /^.{1,255}$/,
    MX: /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    SRV: /^(\d+\s+){3}\S+$/,
    CAA: /^(\d+\s+\w+\s+"[^"]+")$/,
  };

  const pattern = patterns[type];
  if (!pattern) {
    return { valid: false, error: `Unsupported record type: ${type}` };
  }

  if (!pattern.test(value)) {
    return {
      valid: false,
      error: `Invalid ${type} record format`,
    };
  }

  if (type === "A") {
    const parts = value.split(".");
    if (parts.some((p) => parseInt(p) > 255)) {
      return { valid: false, error: "IP address octets must be 0-255" };
    }
  }

  return { valid: true };
}
