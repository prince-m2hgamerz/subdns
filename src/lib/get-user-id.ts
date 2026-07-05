import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

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
      await supabase
        .from("api_keys")
        .update({ last_used: new Date().toISOString() })
        .eq("id", apiKey.id);
      return apiKey.user_id;
    }
    return null;
  }

  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}
