import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InvoiceLayoutProps {
  children: ReactNode;
  className?: string;
}

export function InvoiceLayout({ children, className }: InvoiceLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[210mm] space-y-6 bg-card p-8 print:p-0 print:space-y-0",
        "print:bg-white print:text-black",
        className
      )}
    >
      {children}
    </div>
  );
}
