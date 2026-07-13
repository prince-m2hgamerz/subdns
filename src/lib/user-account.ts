import "server-only";
import { supabase } from "./supabase";
import { deleteDnsRecord } from "./cloudflare";

export async function deleteUserAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  const tables = ["subscriptions", "api_keys"] as const;
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);
    if (error) return { success: false, error: `${table}: ${error.message}` };
  }

  const { data: subdomains } = await supabase
    .from("subdomains")
    .select("*, dns_records(*)")
    .eq("user_id", userId);

  if (subdomains) {
    for (const subdomain of subdomains) {
      if (subdomain.cloudflare_id) {
        try { await deleteDnsRecord(subdomain.cloudflare_id); } catch { }
      }
      for (const record of subdomain.dns_records ?? []) {
        if (record.cloudflare_id) {
          try { await deleteDnsRecord(record.cloudflare_id); } catch { }
        }
      }
    }
  }

  const { error: subdomainErr } = await supabase.from("subdomains").delete().eq("user_id", userId);
  if (subdomainErr) return { success: false, error: `subdomains: ${subdomainErr.message}` };

  const { error: userErr } = await supabase.from("users").delete().eq("id", userId);
  if (userErr) return { success: false, error: `users: ${userErr.message}` };

  return { success: true };
}
