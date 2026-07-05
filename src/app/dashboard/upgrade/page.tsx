"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Check, Loader2 } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/plans";

const CASHFREE_SCRIPT = "https://sdk.cashfree.com/js/v3/cashfree.js";

function loadCashfreeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).Cashfree) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = CASHFREE_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
    document.head.appendChild(script);
  });
}

export default function UpgradePage() {
  const { data: session, status: authStatus } = useSession();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<PlanId | null>(null);
  const scriptLoaded = useRef(false);
  const searchParams = useSearchParams();

  const currentPlan = (session?.user as { plan?: string })?.plan as PlanId || "BRONZE";

  const verifyOrder = useCallback(async (orderId: string) => {
    try {
      const res = await fetch(`/api/payment/verify?order_id=${orderId}`);
      const data = await res.json();
      if (data.success) {
        toast({ title: "Payment Confirmed!", description: `Your plan has been upgraded.`, variant: "success" });
      } else if (data.status === "FAILED") {
        toast({ title: "Payment Failed", description: "Please try again.", variant: "destructive" });
      }
    } catch {
      // silent — verification happens in webhook too
    }
  }, [toast]);

  useEffect(() => {
    if (authStatus === "unauthenticated") redirect("/auth/login");
  }, [authStatus]);

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (orderId) {
      verifyOrder(orderId);
    }
  }, [searchParams, verifyOrder]);

  useEffect(() => {
    loadCashfreeScript()
      .then(() => { scriptLoaded.current = true; })
      .catch(console.error);
  }, []);

  const handleUpgrade = async (planId: PlanId) => {
    setProcessing(planId);
    try {
      if (!scriptLoaded.current) {
        await loadCashfreeScript();
        scriptLoaded.current = true;
      }

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create order");
      }

      const cashfree = (window as any).Cashfree({
        mode: data.mode || "production",
      });

      const paymentResult = await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal",
      });

      if (paymentResult.error) {
        toast({ title: "Payment Failed", description: paymentResult.error.message, variant: "destructive" });
        return;
      }

      if (paymentResult.paymentDetails) {
        const verifyRes = await fetch(`/api/payment/verify?order_id=${data.order_id}`);
        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          toast({ title: "Upgrade Successful!", description: `You are now on the ${PLANS[planId].name} plan.`, variant: "success" });
        } else {
          toast({ title: "Payment Pending", description: "Your payment is being processed. It may take a few minutes.", variant: "default" });
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
                  <div className="h-10 w-20 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="h-4 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const plans = Object.values(PLANS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upgrade Plan</h1>
        <div className="text-sm text-muted-foreground">
          Current plan: <Badge variant="outline">{PLANS[currentPlan].name}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isDowngrade = plan.priority < PLANS[currentPlan].priority;

          return (
            <Card
              key={plan.id}
              className={isCurrent ? "border-foreground/30" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && <Badge>Current</Badge>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.priceDisplay}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                {!isCurrent && !isDowngrade && (
                  <Button
                    className="w-full"
                    variant={plan.price > 0 ? "primary" : "outline"}
                    disabled={processing === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {processing === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : plan.price === 0 ? (
                      "Your Current Plan"
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                )}

                {isDowngrade && (
                  <p className="text-center text-xs text-muted-foreground">
                    Contact support to downgrade
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
