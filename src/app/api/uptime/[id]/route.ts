import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/get-user-id";
import { deleteMonitor, toggleMonitor, runCheck, getRecentChecks } from "@/lib/uptime";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ok = await deleteMonitor(id, userId);
  if (!ok) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ok = await toggleMonitor(id, userId);
  if (!ok) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await runCheck(id);
  const checks = await getRecentChecks(id, 10);
  return NextResponse.json({ success: true, check: result, recentChecks: checks.map((c) => ({
    id: c.id,
    status: c.status,
    statusCode: c.status_code,
    responseTimeMs: c.response_time_ms,
    errorMessage: c.error_message,
    checkedAt: c.checked_at,
  })) });
}
