import { Separator } from "@/components/ui/separator";

interface InvoiceFooterProps {
  companyName?: string;
  supportEmail?: string;
  paymentTerms?: string;
}

export function InvoiceFooter({
  companyName = "M2H Web Solution",
  supportEmail = "support@m2hio.in",
  paymentTerms = "Payment is due within 15 days. Thank you for your business!",
}: InvoiceFooterProps) {
  return (
    <div className="space-y-3 pt-4 print:pt-0">
      <Separator />
      <div className="space-y-1 text-center text-xs text-muted-foreground print:text-gray-500">
        <p>
          {companyName} &mdash; {supportEmail}
        </p>
        <p>{paymentTerms}</p>
      </div>
    </div>
  );
}
