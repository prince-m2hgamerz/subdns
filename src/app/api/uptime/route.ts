import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/get-user-id";
import { getMonitors, createMonitor } from "@/lib/uptime";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const monitors = await getMonitors(userId);
  const data = monitors.map((m) => ({
    id: m.id,
    userId: m.user_id,
    subdomainId: m.subdomain_id,
    label: m.label,
    url: m.url,
    checkInterval: m.check_interval,
    timeout: m.timeout,
    isActive: m.is_active,
    lastStatus: m.last_status,
    lastCheckedAt: m.last_checked_at,
    uptimePercentage: m.uptime_percentage,
    subdomainName: (m as unknown as { subdomains?: { name: string } | null }).subdomains?.name || null,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  }));
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { subdomainId, label, url, checkInterval, timeout } = await req.json();
  if (!subdomainId || !label || !url) {
    return NextResponse.json({ success: false, error: "subdomainId, label, and url are required" }, { status: 400 });
  }
  const result = await createMonitor(userId, subdomainId, label, url, checkInterval, timeout);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true, data: result.data }, { status: 201 });
}
