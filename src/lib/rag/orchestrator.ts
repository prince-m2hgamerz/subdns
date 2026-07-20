import { NextRequest } from "next/server";
import { getUserId } from "@/lib/get-user-id";
import { NVIDIA_API_URL, CHAT_MODEL, SYSTEM_PROMPT_BASE } from "./config";
import { searchKnowledge, formatKnowledgeContext } from "./search";
import { TOOLS_PROMPT_BLOCK } from "./tools";
import { executeTool } from "./executor";

interface OrchestratorMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ToolCallResponse {
  tool: string | null;
  args: Record<string, unknown>;
  reason?: string;
}

async function detectToolCall(
  userMessage: string
): Promise<ToolCallResponse> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return { tool: null, args: {} };

  const prompt = `You are a router for the SubDNS AI assistant. Determine if the user's question requires looking up live account data via a tool.

Available tools:
${TOOLS_PROMPT_BLOCK.split("Available tools:")[1]?.trim() ?? ""}

User question: "${userMessage}"

Respond with ONLY a JSON object on a single line:
- If a tool is needed: {"tool": "tool_name", "args": { ... }}
- If no tool is needed: {"tool": null, "reason": "brief explanation"}`;

  try {
    const res = await fetch(`${NVIDIA_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 256,
      }),
    });

    if (!res.ok) return { tool: null, args: {} };

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // fall through
  }

  return { tool: null, args: {} };
}

function buildSystemPrompt(knowledgeContext: string): string {
  return `${SYSTEM_PROMPT_BASE}

${TOOLS_PROMPT_BLOCK}
${knowledgeContext}`;
}

export interface ChatStreamResult {
  stream: ReadableStream;
  toolUsed: string | null;
}

export async function handleChat(
  req: NextRequest
): Promise<ChatStreamResult | { error: string; status: number }> {
  const userId = await getUserId(req);

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return { error: "Messages array is required", status: 400 };
    }

    const userMessage =
      messages
        .filter((m: any) => m.role === "user")
        .pop()?.content ?? "";

    const knowledgeResults = await searchKnowledge(userMessage);
    let knowledgeContext = formatKnowledgeContext(knowledgeResults);

    if (!knowledgeContext) {
      knowledgeContext = `\n\nNOTE: No relevant knowledge was found for this question. If you can't answer from tool results, say so and suggest what the user can ask about (pricing, features, DNS setup, etc.).`;
    }

    const toolDecision = await detectToolCall(userMessage);

    let toolResultString = "";
    let toolUsed: string | null = null;

    if (toolDecision.tool && userId) {
      toolUsed = toolDecision.tool;
      const result = await executeTool(
        userId,
        toolDecision.tool,
        toolDecision.args
      );
      toolResultString = `\n\nTOOL RESULT (${toolDecision.tool}):\n${JSON.stringify(result.data, null, 2)}`;
    }

    const systemPrompt = buildSystemPrompt(knowledgeContext + toolResultString);

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return { error: "NVIDIA API key not configured", status: 500 };
    }

    const streamResponse = await fetch(`${NVIDIA_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.5,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!streamResponse.ok) {
      const errText = await streamResponse.text();
      console.error("NVIDIA API error:", streamResponse.status, errText);
      return { error: "AI service returned an error", status: streamResponse.status };
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = streamResponse.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data: ")) continue;
              const data = trimmed.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content));
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return { stream, toolUsed };
  } catch (error) {
    console.error("Chat orchestrator error:", error);
    return { error: "Internal server error", status: 500 };
  }
}
