import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/get-user-id";
import { getDnsAnalytics } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const days = parseInt(req.nextUrl.searchParams.get("days") || "7");
  const data = await getDnsAnalytics(userId, Math.min(Math.max(days, 1), 90));
  return NextResponse.json({ success: true, ...data });
}
