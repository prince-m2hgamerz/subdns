import { supabase } from "./supabase";

type ActivityEvent =
  | "DNS_CREATED" | "DNS_DELETED" | "DNS_UPDATED"
  | "SUBDOMAIN_CREATED" | "SUBDOMAIN_DELETED" | "SUBDOMAIN_UPDATED"
  | "LOGIN" | "LOGOUT" | "REGISTER" | "API_REQUEST"
  | "SECURITY_EVENT" | "PROXY_ENABLED" | "PROXY_DISABLED"
  | "API_KEY_CREATED" | "API_KEY_DELETED"
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
