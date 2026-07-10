import type { InvoiceItem } from "@/types/invoice";
import { formatCurrency } from "@/lib/utils";

interface InvoiceTableProps {
  items: InvoiceItem[];
}

export function InvoiceTable({ items }: InvoiceTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border print:border-gray-300">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-accent print:bg-gray-100">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-accent-foreground print:text-gray-900">
              SERVICE
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-accent-foreground print:text-gray-900">
              BILLING PERIOD
            </th>
            <th className="px-4 py-2.5 text-center text-xs font-semibold text-accent-foreground print:text-gray-900">
              QTY
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold text-accent-foreground print:text-gray-900">
              UNIT PRICE
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold text-accent-foreground print:text-gray-900">
              SUBTOTAL
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={i}
              className="border-t border-border print:border-gray-200"
            >
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-foreground print:text-gray-900">
                  {item.service}
                </p>
                <p className="text-xs text-muted-foreground print:text-gray-500">
                  {item.description}
                </p>
              </td>
              <td className="px-4 py-3 text-xs text-foreground print:text-gray-700">
                {item.period}
              </td>
              <td className="px-4 py-3 text-center text-sm text-foreground print:text-gray-900">
                {item.quantity}
              </td>
              <td className="px-4 py-3 text-right text-sm text-foreground print:text-gray-900">
                {formatCurrency(item.unitPrice)}
              </td>
              <td className="px-4 py-3 text-right text-sm font-medium text-foreground print:text-gray-900">
                {formatCurrency(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
