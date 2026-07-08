import { NextResponse } from "next/server";
import { checkDnsPropagation } from "@/lib/cloudflare";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(_request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const result = await checkDnsPropagation(domain);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to check propagation" },
      { status: 500 }
    );
  }
}
