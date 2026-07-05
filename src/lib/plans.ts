export type PlanId = "BRONZE" | "SILVER" | "GOLD";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceDisplay: string;
  description: string;
  features: string[];
  maxSubdomains: number;
  maxDnsRecords: number;
  maxApiKeys: number;
  activityRetentionDays: number;
  priority: number;
}

export const PLANS: Record<PlanId, Plan> = {
  BRONZE: {
    id: "BRONZE",
    name: "Bronze",
    price: 0,
    priceDisplay: "₹0",
    description: "Your free corner of the internet — no credit card, no catch.",
    features: [
      "Up to 10 subdomains",
      "50 DNS records",
      "All DNS record types",
      "Cloudflare proxy (orange cloud)",
      "REST API access",
      "Community support",
    ],
    maxSubdomains: 10,
    maxDnsRecords: 50,
    maxApiKeys: 3,
    activityRetentionDays: 7,
    priority: 0,
  },
  SILVER: {
    id: "SILVER",
    name: "Silver",
    price: 99,
    priceDisplay: "₹99",
    description: "More corners, more control — for professionals who ship.",
    features: [
      "Up to 50 subdomains",
      "500 DNS records",
      "All DNS record types",
      "Cloudflare proxy (orange cloud)",
      "REST API + CLI access",
      "Activity logs (30-day retention)",
      "Webhook notifications",
      "Email support",
    ],
    maxSubdomains: 50,
    maxDnsRecords: 500,
    maxApiKeys: 10,
    activityRetentionDays: 30,
    priority: 1,
  },
  GOLD: {
    id: "GOLD",
    name: "Gold",
    price: 499,
    priceDisplay: "₹499",
    description: "Collaborate at scale with shared workspaces and priority support.",
    features: [
      "Up to 250 subdomains",
      "2,500 DNS records",
      "All DNS record types",
      "Cloudflare proxy (orange cloud)",
      "REST API + CLI access",
      "Activity logs (90-day retention)",
      "Webhook notifications",
      "Team workspaces",
      "Priority support",
    ],
    maxSubdomains: 250,
    maxDnsRecords: 2500,
    maxApiKeys: 25,
    activityRetentionDays: 90,
    priority: 2,
  },
};

export function getPlan(planId: string): Plan {
  return PLANS[planId.toUpperCase() as PlanId] ?? PLANS.BRONZE;
}

export function getUpgradablePlans(currentPlanId: string): Plan[] {
  const current = getPlan(currentPlanId);
  return Object.values(PLANS)
    .filter((p) => p.priority > current.priority)
    .sort((a, b) => a.priority - b.priority);
}
