import "server-only";
import { getSettings } from "./settings-store";

const CASHFREE_API_PROD = "https://api.cashfree.com/pg";
const CASHFREE_API_TEST = "https://sandbox.cashfree.com/pg";

export interface CashfreeOrder {
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
  payment_session_id: string;
}

async function getConfig() {
  const settings = await getSettings();
  const isTest = settings.payment_mode === "test";

  return {
    isTest,
    appId: isTest
      ? process.env.CASHFREE_APP_ID_TEST || ""
      : process.env.CASHFREE_APP_ID || "",
    secretKey: isTest
      ? process.env.CASHFREE_SECRET_KEY_TEST || ""
      : process.env.CASHFREE_SECRET_KEY || "",
    baseUrl: isTest ? CASHFREE_API_TEST : CASHFREE_API_PROD,
  };
}

export async function createOrder(params: {
  orderId: string;
  amount: number;
  customerId: string;
  customerEmail: string;
  customerPhone?: string;
}): Promise<CashfreeOrder> {
  const config = await getConfig();

  const body = {
    order_id: params.orderId,
    order_amount: params.amount,
    order_currency: "INR",
    customer_details: {
      customer_id: params.customerId,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone || "9999999999",
    },
    order_meta: {
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade?order_id={order_id}`,
    },
  };

  const res = await fetch(`${config.baseUrl}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": "2023-08-01",
      "x-client-id": config.appId,
      "x-client-secret": config.secretKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cashfree order failed: ${err}`);
  }

  return res.json();
}

export async function verifyPayment(orderId: string): Promise<{
  order_status: string;
  payment_amount: number;
  payment_time: string;
}> {
  const config = await getConfig();

  const res = await fetch(`${config.baseUrl}/orders/${orderId}/payments`, {
    headers: {
      "x-api-version": "2023-08-01",
      "x-client-id": config.appId,
      "x-client-secret": config.secretKey,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cashfree verify failed: ${err}`);
  }

  const data = await res.json();

  if (Array.isArray(data)) {
    const payment = data[0];
    return {
      order_status: payment?.payment_status || "FAILED",
      payment_amount: payment?.payment_amount || 0,
      payment_time: payment?.payment_time || "",
    };
  }

  return {
    order_status: data.order_status || "FAILED",
    payment_amount: data.payment_amount || 0,
    payment_time: data.payment_time || "",
  };
}

export async function verifyWebhookSignature(
  signature: string,
  timestamp: string,
  body: string
): Promise<boolean> {
  const config = await getConfig();
  const payload = `${body}${timestamp}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(config.secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const computedSignature = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSignature === signature;
}
