import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";
import { createHmac } from "crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: webhook } = await supabase
    .from("webhooks")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!webhook) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  const payload = {
    event: "test.ping",
    timestamp: new Date().toISOString(),
    data: { message: "This is a test webhook from SubDNS" },
  };

  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "SubDNS-Webhook/1.0",
  };

  if (webhook.secret) {
    headers["X-SubDNS-Signature-256"] = createHmac("sha256", webhook.secret)
      .update(body)
      .digest("hex");
  }

  const start = Date.now();
  let status = 0;
  let responseBody = "";

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(10000),
    });
    status = res.status;
    responseBody = await res.text().catch(() => "");
  } catch (err) {
    status = 0;
    responseBody = err instanceof Error ? err.message : "Request failed";
  }

  const durationMs = Date.now() - start;
  const ok = status >= 200 && status < 300;

  await supabase
    .from("webhooks")
    .update({ last_sent_at: new Date().toISOString(), last_status: status })
    .eq("id", id);

  await supabase.from("webhook_deliveries").insert({
    webhook_id: id,
    event: "test.ping",
    url: webhook.url,
    status,
    ok,
    request_body: body.slice(0, 10000),
    response_body: responseBody.slice(0, 10000),
    duration_ms: durationMs,
    attempt: 1,
    max_retries: 0,
  });

  return NextResponse.json({ status, ok, duration_ms: durationMs });
}
