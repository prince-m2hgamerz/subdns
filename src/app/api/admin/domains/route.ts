import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return null;
  const admin = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (admin?.role !== "ADMIN" && admin?.role !== "SUPER_ADMIN") return null;
  return userId;
}

export async function GET() {
  const userId = await checkAdmin(new Request("http://localhost"));
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const domains = await prisma.rootDomain.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(domains);
}

export async function POST(req: Request) {
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

  if (!body.domain || typeof body.domain !== "string") {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  const rootDomain = await prisma.rootDomain.create({
    data: {
      domain: body.domain,
      zoneId: body.cloudflareZoneId ?? "",
      isActive: body.active ?? true,
      isDefault: body.default ?? false,
    },
  });

  return NextResponse.json(rootDomain, { status: 201 });
}
