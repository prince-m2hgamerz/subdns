import { NextResponse } from "next/server";
import { getSettings, updateSetting } from "@/lib/settings-store";
import { requireAdmin } from "@/lib/admin-auth-guard";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const fileSettings = await getSettings();

  const cfConfigured = !!(process.env.CLOUDFLARE_API_EMAIL && process.env.CLOUDFLARE_API_KEY);
  const cashfreeConfigured = !!(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
  const cashfreeTestConfigured = !!(
    process.env.CASHFREE_APP_ID_TEST && process.env.CASHFREE_SECRET_KEY_TEST
  );
  const paymentMode = fileSettings.payment_mode === "prod" ? "prod" : "test";

  const settings = {
    ...fileSettings,
    payment_mode: paymentMode,
    registrationOpen: fileSettings.registrationOpen === "true",
    defaultSubdomainLimit: parseInt(fileSettings.defaultSubdomainLimit ?? "10"),
    maxSubdomainLength: parseInt(fileSettings.maxSubdomainLength ?? "63"),
    cloudflareEmail: process.env.CLOUDFLARE_API_EMAIL ?? "",
    cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID ?? "",
    cloudflareConfigured: cfConfigured,
    cashfreeConfigured,
    cashfreeTestConfigured,
    cashfreeAppId: process.env.CASHFREE_APP_ID ?? "",
    cashfreeAppIdTest: process.env.CASHFREE_APP_ID_TEST ?? "",
  };

  return NextResponse.json({ settings });
}

const ALLOWED_SETTING_KEYS = [
  "siteName",
  "siteDescription",
  "registrationOpen",
  "defaultSubdomainLimit",
  "maxSubdomainLength",
  "payment_mode",
];

const STATIC_KEYS = [
  "cloudflareEmail",
  "cloudflareZoneId",
  "cloudflareConfigured",
  "cashfreeConfigured",
  "cashfreeTestConfigured",
  "cashfreeAppId",
  "cashfreeAppIdTest",
];

function buildSettingsResponse(fileSettings: Record<string, string>) {
  const cfConfigured = !!(process.env.CLOUDFLARE_API_EMAIL && process.env.CLOUDFLARE_API_KEY);
  const cashfreeConfigured = !!(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
  const cashfreeTestConfigured = !!(
    process.env.CASHFREE_APP_ID_TEST && process.env.CASHFREE_SECRET_KEY_TEST
  );
  const paymentMode = fileSettings.payment_mode === "prod" ? "prod" : "test";

  return {
    ...fileSettings,
    payment_mode: paymentMode,
    registrationOpen: fileSettings.registrationOpen === "true",
    defaultSubdomainLimit: parseInt(fileSettings.defaultSubdomainLimit ?? "10"),
    maxSubdomainLength: parseInt(fileSettings.maxSubdomainLength ?? "63"),
    cloudflareEmail: process.env.CLOUDFLARE_API_EMAIL ?? "",
    cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID ?? "",
    cloudflareConfigured: cfConfigured,
    cashfreeConfigured,
    cashfreeTestConfigured,
    cashfreeAppId: process.env.CASHFREE_APP_ID ?? "",
    cashfreeAppIdTest: process.env.CASHFREE_APP_ID_TEST ?? "",
  };
}

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { key, value } = await req.json();

  if (!key || STATIC_KEYS.includes(key) || !ALLOWED_SETTING_KEYS.includes(key)) {
    const fileSettings = await getSettings();
    return NextResponse.json({ settings: buildSettingsResponse(fileSettings) });
  }

  const fileSettings = await updateSetting(key, String(value));
  return NextResponse.json({ settings: buildSettingsResponse(fileSettings) });
}
