import { supabase } from "./supabase";
import { sendNotificationEmail } from "./email";
import { deliverWebhooks, type WebhookEvent } from "./webhooks";

type EmailEvent =
  | "onboarding"
  | "subdomain_created"
  | "dns_created"
  | "dns_updated"
  | "subdomain_down"
  | "account_banned"
  | "plan_changed"
  | "report_status"
  | "api_key_created";

const eventToPrefColumn: Record<string, string> = {
  subdomain_created: "notify_on_subdomain_created",
  dns_created: "notify_on_dns_created",
  dns_updated: "notify_on_dns_updated",
  subdomain_down: "notify_on_subdomain_down",
  account_banned: "notify_on_account_banned",
  plan_changed: "notify_on_plan_changed",
  report_status: "notify_on_report_status",
  api_key_created: "notify_on_api_key_created",
};

const emailToWebhookEvent: Record<EmailEvent, WebhookEvent | null> = {
  onboarding: null,
  subdomain_created: "subdomain.created",
  dns_created: "dns.created",
  dns_updated: "dns.updated",
  subdomain_down: "subdomain.down",
  account_banned: "account.banned",
  plan_changed: "plan.changed",
  report_status: "report.status",
  api_key_created: "api_key.created",
};

async function getUserEmail(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .single();
  return data?.email || null;
}

async function shouldSendEmail(userId: string, event: EmailEvent): Promise<boolean> {
  if (event === "onboarding") return true;
  const column = eventToPrefColumn[event];
  if (!column) return false;
  const { data } = await supabase
    .from("user_notification_preferences")
    .select(column)
    .eq("user_id", userId)
    .single();
  return (data as Record<string, boolean> | null)?.[column] !== false;
}

export async function notify(
  userId: string,
  event: EmailEvent,
  emailData: Record<string, string | number | boolean | undefined>,
  webhookData?: Record<string, unknown>,
): Promise<void> {
  const [email, prefsOk] = await Promise.all([
    getUserEmail(userId),
    shouldSendEmail(userId, event),
  ]);

  await Promise.all([
    prefsOk && email ? sendNotificationEmail(email, event, emailData) : Promise.resolve(),
    (() => {
      const whEvent = emailToWebhookEvent[event];
      if (whEvent) {
        return deliverWebhooks(userId, whEvent, webhookData || emailData as Record<string, unknown>);
      }
      return Promise.resolve();
    })(),
  ]);
}
