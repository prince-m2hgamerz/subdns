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
    .select("id, name, key, scopes, description, expires_at, last_used, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const mapped = (keys ?? []).map((k) => ({
    id: k.id,
    name: k.name,
    key: `${k.key.slice(0, 12)}...`,
    scopes: k.scopes ?? [],
    description: k.description ?? "",
    expiresAt: k.expires_at,
    lastUsed: k.last_used,
    createdAt: k.created_at,
  }));

  return NextResponse.json({ keys: mapped });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, scopes, description, expiresAt } = await req.json();
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

  const validScopes = Array.isArray(scopes) ? scopes : [];
  const insertData: Record<string, unknown> = {
    name,
    key,
    user_id: userId,
    scopes: validScopes.length > 0 ? validScopes : null,
    description: description ?? "",
    expires_at: expiresAt ?? null,
  };
  // Remove null values so defaults apply
  Object.keys(insertData).forEach((k) => insertData[k] == null && delete insertData[k]);

  const { data: apiKey } = await supabase
    .from("api_keys")
    .insert(insertData)
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
