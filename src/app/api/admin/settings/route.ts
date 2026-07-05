import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings-store";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (admin?.role !== "ADMIN" && admin?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fileSettings = await getSettings();

  const settings = {
    ...fileSettings,
    cloudflareEmail: process.env.CLOUDFLARE_EMAIL ?? "",
    cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID ?? "",
    cloudflareConfigured: !!(process.env.CLOUDFLARE_EMAIL && process.env.CLOUDFLARE_API_KEY),
  };

  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (admin?.role !== "ADMIN" && admin?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const fileSettings = await getSettings();

  for (const key of Object.keys(body)) {
    if (key === "cloudflareEmail" || key === "cloudflareZoneId" || key === "cloudflareConfigured") {
      continue;
    }
    fileSettings[key] = String(body[key]);
  }

  const fs = await import("fs/promises");
  const path = await import("path");
  const settingsFile = path.default.join(process.cwd(), "data", "settings.json");
  await fs.writeFile(settingsFile, JSON.stringify(fileSettings, null, 2), "utf-8");

  const settings = {
    ...fileSettings,
    cloudflareEmail: process.env.CLOUDFLARE_EMAIL ?? "",
    cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID ?? "",
    cloudflareConfigured: !!(process.env.CLOUDFLARE_EMAIL && process.env.CLOUDFLARE_API_KEY),
  };

  return NextResponse.json({ settings });
}
