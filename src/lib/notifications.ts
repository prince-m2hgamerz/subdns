import { supabase } from "./supabase";
import { sendNotificationEmail } from "./email";
import { deliverWebhooks, type WebhookEvent } from "./webhooks";
import { sendSms, isPlaceholderEmail } from "./sms";

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

const appName = process.env.APP_NAME || "SubDNS";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://subdns.m2hio.in";

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

async function getUserContact(userId: string): Promise<{ email: string | null; phone: string | null }> {
  const { data } = await supabase
    .from("users")
    .select("email, phone")
    .eq("id", userId)
    .single();
  return { email: data?.email || null, phone: data?.phone || null };
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

function formatSmsMessage(event: EmailEvent, data: Record<string, string | number | boolean | undefined>): string {
  switch (event) {
    case "onboarding":
      return `Welcome to ${appName}! Your account has been created. Dashboard: ${baseUrl}/dashboard`;
    case "subdomain_created":
      return `[${appName}] Subdomain created: ${data.name}.${data.domain}. Manage at ${baseUrl}/dashboard/subdomains`;
    case "dns_created":
      return `[${appName}] DNS record ${data.record_type} created for ${data.subdomain}.${data.domain}. View in dashboard.`;
    case "dns_updated":
      return `[${appName}] DNS record ${data.record_type} updated for ${data.subdomain}. New value: ${data.record_content}`;
    case "subdomain_down":
      return `[${appName}] ALERT: ${data.name}.${data.domain} is DOWN (HTTP ${data.statusCode}). Check: ${baseUrl}/dashboard/uptime`;
    case "account_banned":
      return `[${appName}] Your account has been suspended. Please contact support to resolve this. ${baseUrl}/contact`;
    case "plan_changed":
      return `[${appName}] Plan updated to ${data.plan}. View: ${baseUrl}/dashboard/upgrade`;
    case "report_status":
      return `[${appName}] Report #${data.reportId} status: ${data.status}. View: ${baseUrl}/dashboard/reports`;
    case "api_key_created":
      return `[${appName}] A new API key "${data.name}" was created. If this wasn't you, revoke it at ${baseUrl}/dashboard/api-keys`;
  }
}

export async function notify(
  userId: string,
  event: EmailEvent,
  emailData: Record<string, string | number | boolean | undefined>,
  webhookData?: Record<string, unknown>,
): Promise<void> {
  const [contact, prefsOk] = await Promise.all([
    getUserContact(userId),
    shouldSendEmail(userId, event),
  ]);

  const isPhoneUser = contact.email !== null && isPlaceholderEmail(contact.email);

  const tasks: Promise<boolean>[] = [];

  if (prefsOk) {
    if (!isPhoneUser && contact.email) {
      tasks.push(sendNotificationEmail(contact.email, event, emailData));
    }

    if (contact.phone) {
      let shouldSms = isPhoneUser;
      if (!shouldSms && event !== "onboarding") {
        const { data: smsPref } = await supabase
          .from("user_notification_preferences")
          .select("notify_by_sms")
          .eq("user_id", userId)
          .single();
        shouldSms = (smsPref as Record<string, boolean> | null)?.notify_by_sms === true;
      }
      if (shouldSms) {
        tasks.push(sendSms(contact.phone, formatSmsMessage(event, emailData)));
      }
    }
  }

  const whEvent = emailToWebhookEvent[event];
  if (whEvent) {
    tasks.push(deliverWebhooks(userId, whEvent, webhookData || emailData as Record<string, unknown>).then(() => true));
  }

  await Promise.all(tasks);
}
