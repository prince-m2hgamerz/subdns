import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE!;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

if (!supabaseUrl) throw new Error("Missing SUPABASE_URL");
if (!supabaseServiceRole) throw new Error("Missing SUPABASE_SERVICE_ROLE");

const globalForSupabase = globalThis as unknown as {
  supabaseService: SupabaseClient;
};

export const supabaseService =
  globalForSupabase.supabaseService ??
  (createClient<any>(supabaseUrl, supabaseServiceRole, {
    auth: { persistSession: false },
  }) as SupabaseClient);

export const supabase =
  supabaseService;

export let supabaseAnon: SupabaseClient | null = null;
if (supabaseAnonKey) {
  supabaseAnon = createClient<any>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  }) as SupabaseClient;
}

if (process.env.NODE_ENV !== "production")
  globalForSupabase.supabaseService = supabaseService;
