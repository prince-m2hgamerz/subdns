import { NextRequest, NextResponse } from "next/server";
import { getAllDnsAnalytics } from "@/lib/analytics";
import { requireAdmin } from "@/lib/admin-auth-guard";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const days = parseInt(req.nextUrl.searchParams.get("days") || "7");
  const data = await getAllDnsAnalytics(Math.min(Math.max(days, 1), 90));
  return NextResponse.json({ success: true, ...data });
}
