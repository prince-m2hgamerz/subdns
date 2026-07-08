import { supabase } from "./supabase";
import { randomBytes } from "crypto";

export interface CustomDomainRow {
  id: string;
  user_id: string;
  domain: string;
  subdomain_id: string | null;
  verification_token: string;
  verification_status: "PENDING" | "VERIFIED" | "FAILED";
  ssl_status: "PENDING" | "ACTIVE" | "FAILED";
  created_at: string;
  updated_at: string;
}

export function generateVerificationToken(): string {
  return "sdns-verify-" + randomBytes(16).toString("hex");
}

export async function checkDnsTxtRecord(
  domain: string,
  expectedToken: string
): Promise<boolean> {
  try {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.Answer) return false;
    const values = data.Answer.map(
      (a: { data: string }) => a.data.replace(/"/g, "")
    );
    return values.includes(expectedToken);
  } catch {
    return false;
  }
}

export async function getCustomDomains(userId: string) {
  const { data } = await supabase
    .from("custom_domains")
    .select("*, subdomains!left(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function addCustomDomain(
  userId: string,
  domain: string,
  subdomainId: string | null
) {
  const normalized = domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
  const domainPattern = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
  if (!domainPattern.test(normalized)) {
    return { success: false, error: "Invalid domain format" };
  }
  const { data: existing } = await supabase
    .from("custom_domains")
    .select("id")
    .eq("domain", normalized)
    .maybeSingle();
  if (existing) {
    return { success: false, error: "This domain is already registered" };
  }
  const token = generateVerificationToken();
  const { data, error } = await supabase
    .from("custom_domains")
    .insert({
      user_id: userId,
      domain: normalized,
      subdomain_id: subdomainId || null,
      verification_token: token,
    })
    .select()
    .maybeSingle();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function verifyCustomDomain(
  id: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { data: domain } = await supabase
    .from("custom_domains")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!domain) return { success: false, error: "Domain not found" };
  const verified = await checkDnsTxtRecord(
    domain.domain,
    domain.verification_token
  );
  const status = verified ? "VERIFIED" : "FAILED";
  await supabase
    .from("custom_domains")
    .update({
      verification_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (!verified) {
    return {
      success: false,
      error:
        "TXT record not found. Add the verification token to your domain's DNS TXT records and try again.",
    };
  }
  return { success: true };
}

export async function deleteCustomDomain(
  id: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("custom_domains")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}
