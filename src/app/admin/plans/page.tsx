"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Check, X, Plus, Trash2 } from "lucide-react";

type PlanConfig = {
  id: string;
  name: string;
  description: string;
  price: number;
  priceDisplay: string;
  features: string[];
  maxSubdomains: number;
  maxDnsRecords: number;
  priority: number;
  isActive: boolean;
  dbId: string | null;
};

type PlanForm = {
  name: string;
  description: string;
  price: number;
  features: string[];
};

export default function AdminPlansPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PlanForm>({ name: "", description: "", price: 0, features: [] });

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/plans");
      if (res.status === 403) {
        router.push("/auth/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPlans(data.plans);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load plan configurations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (authStatus === "authenticated") {
      fetchPlans();
    }
  }, [authStatus, fetchPlans, router]);

  const startEdit = (plan: PlanConfig) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      features: [...plan.features],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", description: "", price: 0, features: [] });
  };

  const addFeature = () => {
    setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const updateFeature = (idx: number, val: string) => {
    setForm((prev) => {
      const next = [...prev.features];
      next[idx] = val;
      return { ...prev, features: next };
    });
  };

  const savePlan = async (planId: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          ...form,
          features: form.features.filter((f) => f.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast({
        title: "Plan updated",
        description: `${form.name} configuration saved.`,
        variant: "success",
      });
      setEditingId(null);
      fetchPlans();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save plan configuration.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-5 w-32 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
                <div className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plans</h1>
        <p className="text-sm text-neutral-500">
          Edit pricing plan names, descriptions, prices, and feature lists
        </p>
      </div>

      {plans.map((plan) => {
        const isEditing = editingId === plan.id;

        return (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">
                    {isEditing ? (
                      <Input
                        value={form.name}
                        onChange={(e) =>
                          setForm((prev: any) => ({ ...prev, name: e.target.value }))
                        }
                        className="w-40"
                      />
                    ) : (
                      plan.name
                    )}
                  </CardTitle>
                  <Badge
                    variant={plan.id === "SILVER" ? "success" : "default"}
                  >
                    {plan.id}
                  </Badge>
                  <span className="text-sm text-neutral-500">
                    {plan.maxSubdomains} subdomains max
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={saving}
                        onClick={() => savePlan(plan.id)}
                      >
                        <Check size={14} className="mr-1" />
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X size={14} className="mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEdit(plan)}>
                      <Pencil size={14} className="mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  {isEditing ? (
                    <Input
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev: any) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  ) : (
                    <p className="text-sm text-neutral-500">{plan.description}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (INR/month)</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) =>
                        setForm((prev: any) => ({ ...prev, price: Number(e.target.value) }))
                      }
                      className="w-32"
                    />
                  ) : (
                    <p className="text-sm text-neutral-500">{plan.priceDisplay}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Features</label>
                {isEditing ? (
                  <div className="space-y-2">
                    {form.features.map((f: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={f}
                          onChange={(e) => updateFeature(idx, e.target.value)}
                          placeholder="Feature description"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(idx)}
                          className="text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <Button size="sm" variant="outline" onClick={addFeature}>
                      <Plus size={14} className="mr-1" />
                      Add Feature
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="text-sm text-neutral-500">
                        — {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
