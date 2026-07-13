export interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number | null;
  priority: number | null;
  proxied: boolean;
  status: string;
  cloudflareId: string | null;
  createdAt: string;
}

export interface Subdomain {
  id: string;
  name: string;
  domain: string;
  target: string;
  type: string;
  proxied: boolean;
  status: string;
  dnsMode: "STANDARD" | "DELEGATED";
  nameservers: string[] | null;
  dnsRecords: DnsRecord[];
}

export interface DnsPreset {
  label: string;
  type: string;
  content: string;
  ttl: number | null;
  priority: number | null;
  proxied: boolean;
}

export const DNS_PRESETS: readonly DnsPreset[] = [
  { label: "Vercel", type: "A", content: "76.76.21.21", ttl: 1, priority: null, proxied: true },
  { label: "Netlify", type: "CNAME", content: "{subdomain}.netlify.app", ttl: 1, priority: null, proxied: true },
  { label: "GitHub Pages", type: "A", content: "185.199.108.153", ttl: 1, priority: null, proxied: true },
  { label: "Railway", type: "CNAME", content: "railway.app", ttl: 1, priority: null, proxied: true },
  { label: "Fly.io", type: "CNAME", content: "fly.io", ttl: 1, priority: null, proxied: false },
  { label: "Render", type: "CNAME", content: "onrender.com", ttl: 1, priority: null, proxied: true },
  { label: "Cloudflare Workers", type: "CNAME", content: "*.workers.dev", ttl: 1, priority: null, proxied: true },
  { label: "Bunny CDN", type: "CNAME", content: "{subdomain}.bunnycdn.com", ttl: 1, priority: null, proxied: false },
  { label: "Shopify", type: "CNAME", content: "shops.myshopify.com", ttl: 1, priority: null, proxied: true },
  { label: "Squarespace", type: "CNAME", content: "ext-cust.squarespace.com", ttl: 1, priority: null, proxied: true },
  { label: "Google Sites", type: "CNAME", content: "ghs.googlehosted.com", ttl: 1, priority: null, proxied: true },
  { label: "Google Workspace", type: "MX", content: "ASPMX.L.GOOGLE.COM", ttl: 3600, priority: 1, proxied: false },
  { label: "Zoho Mail", type: "MX", content: "mx.zohomail.com", ttl: 3600, priority: 10, proxied: false },
  { label: "Cloudflare Email", type: "MX", content: "route1.mx.cloudflare.net", ttl: 3600, priority: 10, proxied: false },
];
