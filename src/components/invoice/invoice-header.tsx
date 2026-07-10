import { Badge } from "@/components/ui/badge";

interface InvoiceHeaderProps {
  title?: string;
  orderRef: string;
  issueDate: string;
  dueDate: string;
  status: string;
}

const statusVariant: Record<string, "success" | "warning" | "destructive" | "outline"> = {
  ACTIVE: "success",
  PAID: "success",
  PENDING: "warning",
  FAILED: "destructive",
  CANCELLED: "outline",
  EXPIRED: "outline",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "PAID",
  PAID: "PAID",
  PENDING: "PENDING",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
};

export function InvoiceHeader({
  title = "INVOICE",
  orderRef,
  issueDate,
  dueDate,
  status,
}: InvoiceHeaderProps) {
  return (
    <div className="flex items-start justify-between print:mb-8">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-primary print:text-gray-900">
            {title}
          </h1>
          <div className="hidden print:block">
            <Badge
              variant={statusVariant[status] || "outline"}
              className="text-[10px]"
            >
              {statusLabel[status] || status}
            </Badge>
          </div>
        </div>
        <p className="font-mono text-xs text-muted-foreground print:text-gray-500">
          {orderRef}
        </p>
      </div>
      <div className="space-y-1 text-right">
        <div className="block print:hidden">
          <Badge
            variant={statusVariant[status] || "outline"}
            className="text-[10px]"
          >
            {statusLabel[status] || status}
          </Badge>
        </div>
        <div className="space-y-0.5 text-xs text-muted-foreground print:text-gray-500">
          <p>Issue Date: {issueDate}</p>
          <p>Due Date: {dueDate}</p>
        </div>
      </div>
    </div>
  );
}
