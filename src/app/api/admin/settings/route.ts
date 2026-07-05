import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getSettings, updateSetting } from "@/lib/settings-store";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (admin?.role !== "ADMIN" && admin?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fileSettings = await getSettings();

  const settings = {
    ...fileSettings,
    registrationOpen: fileSettings.registrationOpen === "true",
    defaultSubdomainLimit: parseInt(fileSettings.defaultSubdomainLimit ?? "10"),
    maxSubdomainLength: parseInt(fileSettings.maxSubdomainLength ?? "63"),
    cloudflareEmail: process.env.CLOUDFLARE_API_EMAIL ?? "",
    cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID ?? "",
    cloudflareConfigured: !!(process.env.CLOUDFLARE_API_EMAIL && process.env.CLOUDFLARE_API_KEY),
  };

  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (admin?.role !== "ADMIN" && admin?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { key, value } = await req.json();

  if (!key || ["cloudflareEmail", "cloudflareZoneId", "cloudflareConfigured"].includes(key)) {
    const fileSettings = await getSettings();
    return NextResponse.json({
      settings: {
        ...fileSettings,
        registrationOpen: fileSettings.registrationOpen === "true",
        defaultSubdomainLimit: parseInt(fileSettings.defaultSubdomainLimit ?? "10"),
        maxSubdomainLength: parseInt(fileSettings.maxSubdomainLength ?? "63"),
        cloudflareEmail: process.env.CLOUDFLARE_API_EMAIL ?? "",
        cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID ?? "",
        cloudflareConfigured: !!(process.env.CLOUDFLARE_API_EMAIL && process.env.CLOUDFLARE_API_KEY),
      },
    });
  }

  const fileSettings = await updateSetting(key, String(value));

  const settings = {
    ...fileSettings,
    registrationOpen: fileSettings.registrationOpen === "true",
    defaultSubdomainLimit: parseInt(fileSettings.defaultSubdomainLimit ?? "10"),
    maxSubdomainLength: parseInt(fileSettings.maxSubdomainLength ?? "63"),
    cloudflareEmail: process.env.CLOUDFLARE_API_EMAIL ?? "",
    cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID ?? "",
    cloudflareConfigured: !!(process.env.CLOUDFLARE_API_EMAIL && process.env.CLOUDFLARE_API_KEY),
  };

  return NextResponse.json({ settings });
}
