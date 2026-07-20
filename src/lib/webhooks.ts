import { createHmac } from "crypto";
import { supabase } from "./supabase";

export type WebhookEvent =
  | "subdomain.created"
  | "subdomain.updated"
  | "subdomain.deleted"
  | "subdomain.flagged"
  | "subdomain.down"
  | "dns.created"
  | "dns.updated"
  | "dns.deleted"
  | "dns.record.created"
  | "dns.record.updated"
  | "dns.record.deleted"
  | "ssl.issued"
  | "ssl.renewed"
  | "ssl.failed"
  | "verification.completed"
  | "uptime_monitor.down"
  | "uptime_monitor.up"
  | "account.banned"
  | "account.warning"
  | "plan.changed"
  | "report.status"
  | "api_key.created"
  | "custom_domain.created";

export const ALL_WEBHOOK_EVENTS: WebhookEvent[] = [
  "subdomain.created",
  "subdomain.updated",
  "subdomain.deleted",
  "subdomain.flagged",
  "subdomain.down",
  "dns.created",
  "dns.updated",
  "dns.deleted",
  "dns.record.created",
  "dns.record.updated",
  "dns.record.deleted",
  "ssl.issued",
  "ssl.renewed",
  "ssl.failed",
  "verification.completed",
  "uptime_monitor.down",
  "uptime_monitor.up",
  "account.banned",
  "account.warning",
  "plan.changed",
  "report.status",
  "api_key.created",
  "custom_domain.created",
];

export const WEBHOOK_EVENT_LABELS: Record<WebhookEvent, string> = {
  "subdomain.created": "Subdomain Created",
  "subdomain.updated": "Subdomain Updated",
  "subdomain.deleted": "Subdomain Deleted",
  "subdomain.flagged": "Subdomain Flagged",
  "subdomain.down": "Subdomain Down",
  "dns.created": "DNS Record Created",
  "dns.updated": "DNS Record Updated",
  "dns.deleted": "DNS Record Deleted",
  "dns.record.created": "DNS Record Created",
  "dns.record.updated": "DNS Record Updated",
  "dns.record.deleted": "DNS Record Deleted",
  "ssl.issued": "SSL Certificate Issued",
  "ssl.renewed": "SSL Certificate Renewed",
  "ssl.failed": "SSL Certificate Failed",
  "verification.completed": "Verification Completed",
  "uptime_monitor.down": "Uptime Monitor Down",
  "uptime_monitor.up": "Uptime Monitor Up",
  "account.banned": "Account Banned",
  "account.warning": "Account Warning",
  "plan.changed": "Plan Changed",
  "report.status": "Report Status",
  "api_key.created": "API Key Created",
  "custom_domain.created": "Custom Domain Created",
};

export const DEVELOPER_WEBHOOK_EVENTS: WebhookEvent[] = [
  "subdomain.created",
  "subdomain.updated",
  "subdomain.deleted",
  "dns.record.created",
  "dns.record.updated",
  "dns.record.deleted",
  "ssl.issued",
  "ssl.renewed",
  "ssl.failed",
  "verification.completed",
];

export const DEVELOPER_EVENT_LABELS: Record<string, string> = {
  "subdomain.created": "Subdomain Created",
  "subdomain.updated": "Subdomain Updated",
  "subdomain.deleted": "Subdomain Deleted",
  "dns.record.created": "DNS Record Created",
  "dns.record.updated": "DNS Record Updated",
  "dns.record.deleted": "DNS Record Deleted",
  "ssl.issued": "SSL Certificate Issued",
  "ssl.renewed": "SSL Certificate Renewed",
  "ssl.failed": "SSL Certificate Failed",
  "verification.completed": "Verification Completed",
};

export interface WebhookRow {
  id: string;
  user_id: string;
  url: string;
  events: WebhookEvent[];
  secret: string | null;
  is_active: boolean;
  max_retries: number;
  last_sent_at: string | null;
  last_status: number | null;
  created_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: string;
  url: string;
  status: number;
  ok: boolean;
  request_body: string;
  response_body: string;
  duration_ms: number;
  attempt: number;
  max_retries: number;
  created_at: string;
}

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

const MAX_RETRIES_DEFAULT = 3;

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function recordDelivery(
  webhookId: string,
  event: string,
  url: string,
  status: number,
  ok: boolean,
  requestBody: string,
  responseBody: string,
  durationMs: number,
  attempt: number,
  maxRetries: number,
): Promise<void> {
  await supabase.from("webhook_deliveries").insert({
    webhook_id: webhookId,
    event,
    url,
    status,
    ok,
    request_body: requestBody.slice(0, 10000),
    response_body: responseBody.slice(0, 10000),
    duration_ms: durationMs,
    attempt,
    max_retries: maxRetries,
  });
}

async function deliver(
  url: string,
  payload: WebhookPayload,
  secret?: string,
): Promise<{ status: number; ok: boolean; responseBody: string; durationMs: number }> {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "SubDNS-Webhook/1.0",
  };

  if (secret) {
    headers["X-SubDNS-Signature-256"] = signPayload(body, secret);
  }

  const start = Date.now();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(10000),
    });

    const responseBody = await res.text().catch(() => "");
    return { status: res.status, ok: res.ok, responseBody, durationMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    return { status: 0, ok: false, responseBody: message, durationMs: Date.now() - start };
  }
}

export async function deliverWebhooks(
  userId: string,
  event: WebhookEvent,
  data: Record<string, unknown>,
): Promise<void> {
  const { data: webhooks, error } = await supabase
    .from("webhooks")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .contains("events", [event]);

  if (error || !webhooks?.length) return;

  const payload: WebhookPayload = { event, timestamp: new Date().toISOString(), data };

  for (const webhook of webhooks) {
    const maxRetries = webhook.max_retries ?? MAX_RETRIES_DEFAULT;
    const requestBody = JSON.stringify(payload);

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      const result = await deliver(webhook.url, payload, webhook.secret || undefined);

      await recordDelivery(
        webhook.id,
        event,
        webhook.url,
        result.status,
        result.ok,
        requestBody,
        result.responseBody,
        result.durationMs,
        attempt,
        maxRetries,
      );

      if (result.ok) {
        await supabase
          .from("webhooks")
          .update({
            last_sent_at: new Date().toISOString(),
            last_status: result.status,
          })
          .eq("id", webhook.id);
        break;
      }

      if (attempt <= maxRetries) {
        await supabase
          .from("webhooks")
          .update({
            last_sent_at: new Date().toISOString(),
            last_status: result.status,
          })
          .eq("id", webhook.id);

        const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
        await sleep(backoff);
      }
    }
  }
}

export async function getUserWebhooks(userId: string): Promise<WebhookRow[]> {
  const { data } = await supabase
    .from("webhooks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data as WebhookRow[]) ?? [];
}

export async function getWebhookById(webhookId: string, userId: string): Promise<WebhookRow | null> {
  const { data } = await supabase
    .from("webhooks")
    .select("*")
    .eq("id", webhookId)
    .eq("user_id", userId)
    .single();

  return (data as WebhookRow) ?? null;
}

export async function createWebhook(
  userId: string,
  url: string,
  events: WebhookEvent[],
  secret?: string,
  maxRetries?: number,
): Promise<{ data: WebhookRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("webhooks")
    .insert({
      user_id: userId,
      url,
      events,
      secret: secret || null,
      is_active: true,
      max_retries: maxRetries ?? MAX_RETRIES_DEFAULT,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as WebhookRow, error: null };
}

export async function updateWebhook(
  webhookId: string,
  userId: string,
  updates: Partial<{
    url: string;
    events: WebhookEvent[];
    is_active: boolean;
    secret: string | null;
    max_retries: number;
  }>,
): Promise<{ data: WebhookRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("webhooks")
    .update(updates)
    .eq("id", webhookId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as WebhookRow, error: null };
}

export async function deleteWebhook(webhookId: string, userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("webhooks")
    .delete()
    .eq("id", webhookId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function generateWebhookSecret(): Promise<string> {
  const { randomBytes } = await import("crypto");
  return randomBytes(24).toString("hex");
}

export async function getWebhookDeliveries(
  webhookId: string,
  userId: string,
  limit = 20,
): Promise<WebhookDelivery[]> {
  const { data } = await supabase
    .from("webhook_deliveries")
    .select("*, webhooks!inner(user_id)")
    .eq("webhooks.user_id", userId)
    .eq("webhook_deliveries.webhook_id", webhookId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as unknown as WebhookDelivery[]) ?? [];
}
