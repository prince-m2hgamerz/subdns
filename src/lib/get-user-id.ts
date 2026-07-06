import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

async function isUserBanned(userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from("users")
    .select("is_banned")
    .eq("id", userId)
    .single();
  return user?.is_banned === true;
}

export async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const key = authHeader.slice("Bearer ".length).trim();
    const { data: apiKey } = await supabase
      .from("api_keys")
      .select("*")
      .eq("key", key)
      .single();
    if (apiKey) {
      if (await isUserBanned(apiKey.user_id)) return null;
      await supabase
        .from("api_keys")
        .update({ last_used: new Date().toISOString() })
        .eq("id", apiKey.id);
      return apiKey.user_id;
    }
    return null;
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id ?? null;
  if (userId && (await isUserBanned(userId))) return null;
  return userId;
}
