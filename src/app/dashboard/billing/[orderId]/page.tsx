"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { InvoiceData } from "@/types/invoice";
import {
  InvoiceLayout,
  InvoiceHeader,
  InvoiceCompanyInfo,
  InvoiceBillingInfo,
  InvoiceTable,
  InvoiceSummary,
  InvoicePaymentInfo,
  InvoiceSubscriptionInfo,
  InvoiceFooter,
  InvoiceActions,
} from "@/components/invoice";

export default function InvoiceDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/billing/invoices/${orderId}`)
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load invoice");
        }
        return r.json();
      })
      .then((res) => {
        if (res.invoice) setInvoice(res.invoice);
        else throw new Error("Invoice data not found");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">Invoice not found</h2>
        <p className="text-sm text-muted-foreground">{error || "This invoice does not exist."}</p>
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to billing
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to billing
        </Link>
        <InvoiceActions orderId={orderId} />
      </div>

      <InvoiceLayout>
        <InvoiceHeader
          orderRef={invoice.orderRef}
          issueDate={invoice.issueDate}
          dueDate={invoice.dueDate}
          status={invoice.status}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 print:gap-8">
          <InvoiceCompanyInfo
            name="M2H Web Solution"
            email="support@m2hio.in"
          />
          <InvoiceBillingInfo
            name={invoice.customer.name}
            email={invoice.customer.email}
          />
        </div>

        <InvoiceTable items={invoice.items} />

        <InvoiceSummary
          subtotal={invoice.amount}
          gstRate={invoice.gstRate}
          gstAmount={invoice.gstAmount}
          total={invoice.total}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 print:gap-8">
          <InvoicePaymentInfo
            paymentMethod={invoice.paymentMethod}
            transactionId={invoice.transactionId}
            paidAt={invoice.paidAt}
          />
          <InvoiceSubscriptionInfo
            planName={invoice.planName}
            nextRenewal={invoice.nextRenewal}
          />
        </div>

        <InvoiceFooter />
      </InvoiceLayout>
    </div>
  );
}
