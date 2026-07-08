import { createHmac } from "crypto";
import { supabase } from "./supabase";

export type WebhookEvent =
  | "subdomain.created"
  | "dns.created"
  | "dns.updated"
  | "subdomain.down"
  | "account.banned"
  | "plan.changed"
  | "report.status"
  | "api_key.created";

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

async function deliver(url: string, payload: WebhookPayload, secret?: string): Promise<{ status: number; ok: boolean }> {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "SubDNS-Webhook/1.0",
  };
  if (secret) {
    headers["X-SubDNS-Signature-256"] = signPayload(body, secret);
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(10000),
    });
    return { status: res.status, ok: res.ok };
  } catch {
    return { status: 0, ok: false };
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
    const result = await deliver(webhook.url, payload, webhook.secret || undefined);
    await supabase
      .from("webhooks")
      .update({
        last_sent_at: new Date().toISOString(),
        last_status: result.status,
      })
      .eq("id", webhook.id);
  }
}
