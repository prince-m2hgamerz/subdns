export interface InvoiceItem {
  service: string;
  description: string;
  period: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InvoiceData {
  orderId: string;
  orderRef: string;
  status: string;
  planName: string;
  planId: string;
  amount: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  issueDate: string;
  dueDate: string;
  paidAt: string | null;
  nextRenewal: string | null;
  paymentMethod: string;
  transactionId: string | null;
  billingPeriod: { start: string; end: string };
  items: InvoiceItem[];
  customer: { name: string; email: string };
  createdAt: string;
}
