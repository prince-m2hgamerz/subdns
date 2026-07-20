import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";
import { getActiveSubscription } from "@/lib/subscription";

const WEBHOOK_LIMITS: Record<string, number> = {
  silver: 5,
  gold: 20,
};

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("webhooks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const subscription = await getActiveSubscription(userId);
  const plan = subscription?.plan?.toLowerCase() || "free";
  const limit = WEBHOOK_LIMITS[plan] ?? 0;

  return NextResponse.json({ webhooks: data || [], total: data?.length || 0, limit });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, events, secret, max_retries } = await req.json();

  if (!url || !url.startsWith("https://")) {
    return NextResponse.json({ error: "URL must start with https://" }, { status: 400 });
  }

  if (!events || !Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: "At least one event is required" }, { status: 400 });
  }

  const subscription = await getActiveSubscription(userId);
  const plan = subscription?.plan?.toLowerCase() || "free";
  const limit = WEBHOOK_LIMITS[plan] ?? 0;

  if (limit === 0) {
    return NextResponse.json({ error: "Webhooks are not available on your plan" }, { status: 403 });
  }

  const { count } = await supabase
    .from("webhooks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count !== null && count >= limit) {
    return NextResponse.json(
      { error: `You have reached the maximum of ${limit} webhooks on your plan` },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("webhooks")
    .insert({
      user_id: userId,
      url,
      events,
      secret: secret || null,
      max_retries: max_retries ?? 3,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
