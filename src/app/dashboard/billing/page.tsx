"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, Receipt } from "lucide-react";
import Link from "next/link";

interface Invoice {
  order_id: string;
  plan: string;
  plan_name: string;
  amount: number;
  amount_display: string;
  status: string;
  created_at: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/billing/invoices")
      .then((r) => r.json())
      .then((res) => {
        if (res.invoices) setInvoices(res.invoices);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">View your payment history and invoices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Receipt className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No invoices yet</p>
              <Link
                href="/dashboard/upgrade"
                className="text-sm font-medium text-primary hover:underline"
              >
                Upgrade your plan
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Order</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Plan</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Amount</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.order_id} className="border-b border-border last:border-0">
                      <td className="py-3">
                        <Link
                          href={`/dashboard/billing/${inv.order_id}`}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          {inv.order_id}
                        </Link>
                      </td>
                      <td className="py-3">{inv.plan_name}</td>
                      <td className="py-3">{inv.amount_display}</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <Badge
                          variant={inv.status === "ACTIVE" ? "success" : "outline"}
                          className="text-[10px]"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = `/api/billing/invoices/${inv.order_id}/download`;
                            a.download = `invoice-${inv.order_id}.pdf`;
                            a.click();
                          }}
                          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          title="Download invoice"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
