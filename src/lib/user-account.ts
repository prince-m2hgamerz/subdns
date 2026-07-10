import "server-only";
import { supabase } from "./supabase";

export async function deleteUserAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  const tables = ["subscriptions", "api_keys"] as const;
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);
    if (error) return { success: false, error: `${table}: ${error.message}` };
  }

  const { error: subdomainErr } = await supabase.from("subdomains").delete().eq("user_id", userId);
  if (subdomainErr) return { success: false, error: `subdomains: ${subdomainErr.message}` };

  const { error: userErr } = await supabase.from("users").delete().eq("id", userId);
  if (userErr) return { success: false, error: `users: ${userErr.message}` };

  return { success: true };
}
