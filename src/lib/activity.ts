import { supabase } from "./supabase";

type ActivityEvent =
  | "DNS_CREATED" | "DNS_DELETED" | "DNS_UPDATED" | "DNS_BULK_DELETED"
  | "SUBDOMAIN_CREATED" | "SUBDOMAIN_DELETED" | "SUBDOMAIN_UPDATED" | "SUBDOMAIN_BULK_DELETED"
  | "LOGIN" | "LOGOUT" | "REGISTER" | "API_REQUEST"
  | "SECURITY_EVENT" | "PROXY_ENABLED" | "PROXY_DISABLED"
  | "API_KEY_CREATED" | "API_KEY_UPDATED" | "API_KEY_DELETED"
  | "ADMIN_DNS_CREATED" | "ADMIN_DNS_DELETED" | "ADMIN_DNS_UPDATED" | "ADMIN_SUBDOMAIN_CREATED" | "ADMIN_SUBDOMAIN_DELETED" | "ADMIN_SUBDOMAIN_UPDATED"
  | "CONTACT_SENT" | "REPORT_SUBMITTED"
  | "SUBSCRIPTION_CREATED" | "SUBSCRIPTION_ACTIVATED" | "SUBSCRIPTION_CANCELLED" | "SUBSCRIPTION_EXPIRED";

export async function logActivity(params: {
  userId?: string;
  subdomainId?: string;
  ip?: string;
  userAgent?: string;
  type?: ActivityEvent;
  event?: ActivityEvent;
  description?: string;
  metadata?: unknown;
}) {
  try {
    await supabase.from("activities").insert({
      type: params.type || params.event || "API_REQUEST",
      description:
        params.description ||
        (typeof params.metadata === "string"
          ? params.metadata
          : JSON.stringify(params.metadata || {})),
      user_id: params.userId,
      subdomain_id: params.subdomainId,
      ip: params.ip,
      user_agent: params.userAgent,
      metadata: typeof params.metadata === "object" && params.metadata !== null
        ? params.metadata
        : {},
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
