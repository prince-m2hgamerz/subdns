interface InvoiceBillingInfoProps {
  name: string;
  email: string;
  label?: string;
}

export function InvoiceBillingInfo({
  name,
  email,
  label = "BILL TO",
}: InvoiceBillingInfoProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold tracking-wider text-accent print:text-indigo-700">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground print:text-gray-900">
        {name}
      </p>
      <p className="text-xs text-muted-foreground print:text-gray-500">
        {email}
      </p>
    </div>
  );
}
