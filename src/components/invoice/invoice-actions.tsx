"use client";

import { Download, Printer, Copy, Check } from "lucide-react";
import { useState } from "react";

interface InvoiceActionsProps {
  orderId: string;
}

export function InvoiceActions({ orderId }: InvoiceActionsProps) {
  const [copied, setCopied] = useState(false);

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href = `/api/billing/invoices/${orderId}/download`;
    a.download = `invoice-${orderId}.pdf`;
    a.click();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/dashboard/billing/${orderId}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground print:hidden"
      >
        <Printer className="h-3.5 w-3.5" />
        Print
      </button>
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground print:hidden"
      >
        <Download className="h-3.5 w-3.5" />
        Download PDF
      </button>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground print:hidden"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? "Copied" : "Share"}
      </button>
    </div>
  );
}
