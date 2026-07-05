import "server-only";
import { supabase } from "./supabase";

const DEFAULT_SETTINGS: Record<string, string> = {
  siteName: "SubDNS",
  siteDescription: "Subdomain Management Platform",
  registrationOpen: "true",
  defaultSubdomainLimit: "10",
  maxSubdomainLength: "63",
  payment_mode: "test",
};

export async function getSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("app_settings").select("key, value");

  if (error) throw new Error(`Failed to fetch settings: ${error.message}`);

  const db = Object.fromEntries(
    (data ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
  );

  return { ...DEFAULT_SETTINGS, ...db };
}

export async function updateSetting(key: string, value: string): Promise<Record<string, string>> {
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) throw new Error(`Failed to update setting: ${error.message}`);

  return getSettings();
}

export async function deleteSetting(key: string): Promise<Record<string, string>> {
  const { error } = await supabase.from("app_settings").delete().eq("key", key);

  if (error) throw new Error(`Failed to delete setting: ${error.message}`);

  return getSettings();
}
