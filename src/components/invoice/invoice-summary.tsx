import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface InvoiceSummaryProps {
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
}

export function InvoiceSummary({
  subtotal,
  gstRate,
  gstAmount,
  total,
}: InvoiceSummaryProps) {
  return (
    <div className="ml-auto w-full max-w-xs space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground print:text-gray-500">
          Subtotal:
        </span>
        <span className="text-foreground print:text-gray-900">
          {formatCurrency(subtotal)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground print:text-gray-500">
          GST ({gstRate}%):
        </span>
        <span className="text-foreground print:text-gray-900">
          {formatCurrency(gstAmount)}
        </span>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-foreground print:text-gray-900">
          Total:
        </span>
        <span className="text-lg font-bold text-accent print:text-indigo-700">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
