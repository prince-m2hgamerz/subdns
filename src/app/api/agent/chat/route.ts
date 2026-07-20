import { NextRequest } from "next/server";
import { handleChat } from "@/lib/rag/orchestrator";

export async function POST(req: NextRequest) {
  const result = await handleChat(req);

  if ("error" in result) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
      "X-Tool-Used": result.toolUsed ?? "",
    },
  });
}
