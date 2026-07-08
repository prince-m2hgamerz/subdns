import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";

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
    const { createHmac } = await import("crypto");
    headers["X-SubDNS-Signature-256"] = createHmac("sha256", webhook.secret)
      .update(body)
      .digest("hex");
  }

  let status = 0;
  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(10000),
    });
    status = res.status;
  } catch {
    status = 0;
  }

  await supabase
    .from("webhooks")
    .update({ last_sent_at: new Date().toISOString(), last_status: status })
    .eq("id", id);

  return NextResponse.json({ status, ok: status >= 200 && status < 300 });
}
