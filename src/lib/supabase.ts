import { createClient, SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as { supabase: SupabaseClient };

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE!;

if (!supabaseUrl) throw new Error("Missing SUPABASE_URL");
if (!supabaseServiceRole) throw new Error("Missing SUPABASE_SERVICE_ROLE");

export const supabase =
  globalForSupabase.supabase ??
  createClient<any>(supabaseUrl, supabaseServiceRole, {
    auth: { persistSession: false },
  }) as SupabaseClient;

export const supabaseAdmin =
  createClient<any>(supabaseUrl, supabaseServiceRole, {
    auth: { persistSession: false },
  }) as SupabaseClient;

if (process.env.NODE_ENV !== "production") globalForSupabase.supabase = supabase;
