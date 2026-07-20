import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/get-user-id";
import { supabase } from "@/lib/supabase";
import { crawlKnowledge, clearKnowledge } from "@/lib/rag/crawler";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await clearKnowledge();
    const result = await crawlKnowledge();

    if (result.error) {
      return NextResponse.json(
        { error: result.error, count: result.count },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Knowledge base reindexed: ${result.count} chunks`,
      count: result.count,
    });
  } catch (err: any) {
    console.error("Reindex error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await clearKnowledge();

    return NextResponse.json({
      success: true,
      message: "Knowledge base cleared",
    });
  } catch (err: any) {
    console.error("Clear error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
