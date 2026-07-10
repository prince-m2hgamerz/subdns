interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-28 text-muted-foreground print:text-gray-500">
        {label}
      </span>
      <span className="font-medium text-foreground print:text-gray-900">
        {value || "\u2014"}
      </span>
    </div>
  );
}

interface InvoicePaymentInfoProps {
  paymentMethod: string;
  transactionId: string | null;
  paidAt: string | null;
}

export function InvoicePaymentInfo({
  paymentMethod,
  transactionId,
  paidAt,
}: InvoicePaymentInfoProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold tracking-wider text-accent print:text-indigo-700">
        PAYMENT DETAILS
      </p>
      <DetailRow label="Payment Method:" value={paymentMethod} />
      <DetailRow
        label="Transaction ID:"
        value={
          transactionId
            ? transactionId.length > 22
              ? transactionId.substring(0, 22) + "..."
              : transactionId
            : "\u2014"
        }
      />
      <DetailRow label="Payment Date:" value={paidAt || "\u2014"} />
    </div>
  );
}
