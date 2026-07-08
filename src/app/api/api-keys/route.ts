import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateApiKey } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { getUserId } from "@/lib/get-user-id";
import { getPlan } from "@/lib/plans";
import { checkPlanAccess } from "@/lib/subscription";
import { notify } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: keys } = await supabase
    .from("api_keys")
    .select("id, name, key, last_used, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();
  const plan = getPlan(user?.plan ?? "BRONZE");

  const access = await checkPlanAccess(userId, plan.id);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  const { count: apiKeyCount } = await supabase
    .from("api_keys")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if ((apiKeyCount ?? 0) >= plan.maxApiKeys) {
    return NextResponse.json({ error: `API key limit (${plan.maxApiKeys}) reached. Upgrade your plan.` }, { status: 429 });
  }

  const key = `subdns_${generateApiKey()}`;

  const { data: apiKey } = await supabase
    .from("api_keys")
    .insert({ name, key, user_id: userId })
    .select("id, name, key")
    .single();

  await logActivity({
    userId,
    event: "API_KEY_CREATED",
    metadata: JSON.stringify({ keyId: apiKey!.id, name }),
    ip: req.headers.get("x-forwarded-for") || "",
    userAgent: req.headers.get("user-agent") || "",
  });

  try { await notify(userId, "api_key_created", { name }); } catch {}

  return NextResponse.json({ key: apiKey!.key }, { status: 201 });
}
