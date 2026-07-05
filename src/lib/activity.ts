import { prisma } from "./prisma";

type ActivityEvent =
  | "DNS_CREATED" | "DNS_DELETED" | "DNS_UPDATED"
  | "SUBDOMAIN_CREATED" | "SUBDOMAIN_DELETED" | "SUBDOMAIN_UPDATED"
  | "LOGIN" | "LOGOUT" | "REGISTER" | "API_REQUEST"
  | "SECURITY_EVENT" | "PROXY_ENABLED" | "PROXY_DISABLED"
  | "API_KEY_CREATED" | "API_KEY_DELETED"
  | "CONTACT_SENT" | "REPORT_SUBMITTED";

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
    await prisma.activity.create({
      data: {
        type: params.type || params.event || "API_REQUEST",
        description:
          params.description ||
          (typeof params.metadata === "string"
            ? params.metadata
            : JSON.stringify(params.metadata || {})),
        userId: params.userId,
        subdomainId: params.subdomainId,
        ip: params.ip,
        userAgent: params.userAgent,
        metadata: typeof params.metadata === "object" && params.metadata !== null
          ? params.metadata
          : {},
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
