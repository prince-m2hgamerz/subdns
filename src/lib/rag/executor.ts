import { supabase } from "@/lib/supabase";
import { getPlan, getUpgradablePlans } from "@/lib/plans";
import { getActiveSubscription, checkPlanAccess } from "@/lib/subscription";

export interface ToolResult {
  success: boolean;
  data: unknown;
  error?: string;
}

export async function executeTool(
  userId: string,
  toolName: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case "get_user_info":
        return await getUserInfo(userId);
      case "list_subdomains":
        return await listSubdomains(userId, args);
      case "get_dns_records":
        return await getDnsRecords(userId, args);
      case "get_subscription":
        return await getSubscriptionInfo(userId);
      case "check_plan_access":
        return await checkPlanAccessTool(userId, args);
      default:
        return { success: false, data: null, error: `Unknown tool: ${toolName}` };
    }
  } catch (err: any) {
    return { success: false, data: null, error: err.message };
  }
}

async function getUserInfo(userId: string): Promise<ToolResult> {
  const { data: user } = await supabase
    .from("users")
    .select("id, email, plan, created_at")
    .eq("id", userId)
    .single();

  if (!user) return { success: false, data: null, error: "User not found" };

  const { count: subdomainCount } = await supabase
    .from("subdomains")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: dnsCount } = await supabase
    .from("dns_records")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const plan = getPlan(user.plan);

  return {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      plan: user.plan,
      planName: plan.name,
      maxSubdomains: plan.maxSubdomains,
      maxDnsRecords: plan.maxDnsRecords,
      subdomainCount: subdomainCount ?? 0,
      dnsRecordCount: dnsCount ?? 0,
      memberSince: user.created_at,
    },
  };
}

async function listSubdomains(
  userId: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  let query = supabase
    .from("subdomains")
    .select("id, name, status, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (args.status && typeof args.status === "string") {
    query = query.eq("status", args.status);
  }

  const { data, error } = await query;
  if (error) throw error;

  return {
    success: true,
    data: data ?? [],
  };
}

async function getDnsRecords(
  userId: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const subdomainId = args.subdomainId as string;
  if (!subdomainId)
    return { success: false, data: null, error: "subdomainId is required" };

  const { data: subdomain } = await supabase
    .from("subdomains")
    .select("id")
    .eq("id", subdomainId)
    .eq("user_id", userId)
    .single();

  if (!subdomain)
    return { success: false, data: null, error: "Subdomain not found or access denied" };

  const { data, error } = await supabase
    .from("dns_records")
    .select("id, type, name, value, proxied, ttl, created_at, updated_at")
    .eq("subdomain_id", subdomainId)
    .order("type", { ascending: true });

  if (error) throw error;

  return {
    success: true,
    data: data ?? [],
  };
}

async function getSubscriptionInfo(userId: string): Promise<ToolResult> {
  const sub = await getActiveSubscription(userId);

  if (!sub) {
    const { data: user } = await supabase
      .from("users")
      .select("plan")
      .eq("id", userId)
      .single();

    return {
      success: true,
      data: {
        active: false,
        currentPlan: user?.plan ?? "BRONZE",
        message: "No active subscription. You are on the free plan.",
      },
    };
  }

  return {
    success: true,
    data: {
      active: true,
      plan: sub.plan,
      orderAmount: sub.order_amount,
      paidAmount: sub.paid_amount,
      paidAt: sub.paid_at,
      status: sub.status,
    },
  };
}

async function checkPlanAccessTool(
  userId: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const requiredPlan = (args.requiredPlan as string) ?? "BRONZE";
  const result = await checkPlanAccess(userId, requiredPlan);

  return {
    success: true,
    data: {
      ok: result.ok,
      error: result.error ?? null,
      requiredPlan,
      upgradablePlans: !result.ok
        ? getUpgradablePlans(requiredPlan).map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            priceDisplay: p.priceDisplay,
          }))
        : [],
    },
  };
}
