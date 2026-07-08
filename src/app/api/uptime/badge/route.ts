import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("Missing id", { status: 400 });
  const { data: monitor } = await supabaseService
    .from("uptime_monitors")
    .select("last_status, uptime_percentage")
    .eq("id", id)
    .maybeSingle();
  const status = (monitor?.last_status || "UNKNOWN") as string;
  const pct = monitor?.uptime_percentage ?? 100;
  const color = status === "UP" ? "#22c55e" : status === "DOWN" ? "#ef4444" : "#a3a3a3";
  const label = `uptime ${pct}%`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="22"><rect rx="3" width="140" height="22" fill="#555"/><rect rx="3" x="69" width="71" height="22" fill="${color}"/><text x="5" y="15" font-family="monospace" font-size="12" fill="#fff">uptime</text><text x="73" y="15" font-family="monospace" font-size="12" fill="#fff">${pct}%</text></svg>`;
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "max-age=300" } });
}
