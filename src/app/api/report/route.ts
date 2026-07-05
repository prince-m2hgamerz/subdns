import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { getUserId } from "@/lib/get-user-id";

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, subject, description } = await req.json();

  if (!subject || !description) {
    return NextResponse.json({ error: "Subject and description are required" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
  const userAgent = req.headers.get("user-agent") || undefined;

  const report = await prisma.report.create({
    data: { type: type || "ISSUE", subject, description, userId },
  });

  await logActivity({
    userId,
    type: "REPORT_SUBMITTED",
    description: `Report submitted: ${subject}`,
    ip,
    userAgent,
    metadata: { reportId: report.id, type: report.type },
  });

  return NextResponse.json({ success: true, id: report.id });
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  const isAdmin = user && user.role !== "USER";

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  if (isAdmin) {
    const where = status ? { status } : {};
    const reports = await prisma.report.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reports });
  }

  const where = status ? { status, userId } : { userId };
  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reports });
}
