import { supabase } from "./supabase";

export type SubscriptionStatus = "PENDING" | "ACTIVE" | "FAILED" | "CANCELLED" | "EXPIRED";

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  order_id: string;
  order_amount: number;
  payment_session_id: string | null;
  paid_amount: number | null;
  status: SubscriptionStatus;
  paid_at: string | null;
  created_at: string;
}

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as Subscription | null;
}

export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const sub = await getActiveSubscription(userId);
  if (!sub) return false;
  if (!sub.paid_at) return false;

  const paidAt = new Date(sub.paid_at);
  const expiresAt = new Date(paidAt.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (new Date() > expiresAt) {
    await supabase
      .from("subscriptions")
      .update({ status: "EXPIRED" })
      .eq("id", sub.id);

    await supabase
      .from("users")
      .update({ plan: "BRONZE" })
      .eq("id", userId);

    return false;
  }

  return true;
}

export async function checkPlanAccess(userId: string, requiredPlan: string): Promise<{ ok: boolean; error?: string }> {
  const { data: user } = await supabase
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();

  if (!user) return { ok: false, error: "User not found" };

  const planPriority: Record<string, number> = { BRONZE: 0, SILVER: 1, GOLD: 2 };
  const userPriority = planPriority[user.plan] ?? 0;
  const requiredPriority = planPriority[requiredPlan] ?? 0;

  if (userPriority >= requiredPriority) {
    if (user.plan !== "BRONZE") {
      const sub = await getActiveSubscription(userId);
      if (!sub) {
        await supabase
          .from("users")
          .update({ plan: "BRONZE" })
          .eq("id", userId);
        return { ok: false, error: "Your subscription has expired. Please purchase a new plan." };
      }

      if (sub.paid_at) {
        const paidAt = new Date(sub.paid_at);
        const expiresAt = new Date(paidAt.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (new Date() > expiresAt) {
          await supabase
            .from("subscriptions")
            .update({ status: "EXPIRED" })
            .eq("id", sub.id);

          await supabase
            .from("users")
            .update({ plan: "BRONZE" })
            .eq("id", userId);

          return { ok: false, error: "Your subscription has expired. Please purchase a new plan." };
        }
      }
    }

    return { ok: true };
  }

  return { ok: false, error: "Please upgrade your plan to access this feature." };
}
