"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Send, Bot, User, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your SubDNS AI assistant. Ask me about managing your subdomains, DNS records, analytics, or anything about the platform.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError("");
    const conversation = [...messages, { role: "user", content: text }];
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);
    setLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessages((prev) => prev.slice(0, -1));
        setError(data.error || "Failed to get response");
        return;
      }

      const toolHeader = res.headers.get("X-Tool-Used");
      let toolLabel: string | null = null;
      if (toolHeader) {
        const names: Record<string, string> = {
          get_user_info: "Fetching your account info",
          list_subdomains: "Looking up your subdomains",
          get_dns_records: "Querying DNS records",
          get_subscription: "Checking subscription info",
          check_plan_access: "Verifying plan access",
        };
        toolLabel = names[toolHeader] || `Running ${toolHeader}`;
        setToolStatus(toolLabel);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (firstChunk && chunk.trim()) {
          firstChunk = false;
          setToolStatus(null);
        }
        setMessages((prev) => {
          const msgs = [...prev];
          const last = msgs[msgs.length - 1];
          if (last.role === "assistant") {
            msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
          }
          return msgs;
        });
      }
    } catch (err: any) {
      setMessages((prev) => prev.slice(0, -1));
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
      setToolStatus(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about your subdomains, DNS, or get help managing your account
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-sm">SubDNS Agent</CardTitle>
              <CardDescription className="text-xs">Platform knowledge assistant</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-card-foreground border prose prose-sm dark:prose-invert",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {toolStatus || "Thinking..."}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </CardContent>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask something about your subdomains..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
