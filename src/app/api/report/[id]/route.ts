import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";
import { camelCaseKeys } from "@/lib/transform";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status, priority } = await req.json();

  const updateData: Record<string, string> = {};
  if (status) {
    if (!["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updateData.status = status;
  }
  if (priority) {
    if (!["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }
    updateData.priority = priority;
  }

  const { data: updated } = await supabase
    .from("reports")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  return NextResponse.json({ report: camelCaseKeys(updated) });
}
