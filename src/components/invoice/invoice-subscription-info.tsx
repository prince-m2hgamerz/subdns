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

interface InvoiceSubscriptionInfoProps {
  planName: string;
  billingCycle?: string;
  nextRenewal: string | null;
}

export function InvoiceSubscriptionInfo({
  planName,
  billingCycle = "Monthly",
  nextRenewal,
}: InvoiceSubscriptionInfoProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold tracking-wider text-accent print:text-indigo-700">
        SUBSCRIPTION DETAILS
      </p>
      <DetailRow label="Plan:" value={planName} />
      <DetailRow label="Billing Cycle:" value={billingCycle} />
      <DetailRow label="Next Renewal:" value={nextRenewal || "\u2014"} />
    </div>
  );
}
