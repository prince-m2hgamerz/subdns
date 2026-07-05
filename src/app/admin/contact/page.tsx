"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageSquare } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  user?: { name: string | null; email: string } | null;
}

export default function AdminContactPage() {
  const { data: session, status: authStatus } = useSession();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (authStatus === "authenticated") fetchMessages();
  }, [authStatus, filter]);

  async function fetchMessages() {
    setLoading(true);
    try {
      const url = filter ? `/api/contact?status=${filter}` : "/api/contact";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchMessages();
  }

  if (authStatus === "unauthenticated") redirect("/auth/login");

  if (authStatus === "loading") {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadCount = messages.filter((m) => m.status === "UNREAD").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          <p className="text-sm text-neutral-500">
            {unreadCount > 0
              ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
              : "All messages read"}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {["", "UNREAD", "READ", "RESOLVED"].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s || "All"}
          </Button>
        ))}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12">
            <MessageSquare className="h-8 w-8 text-neutral-400" />
            <p className="text-sm text-neutral-500">No messages found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card key={msg.id} className={msg.status === "UNREAD" ? "border-l-2 border-l-blue-500" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{msg.subject}</CardTitle>
                    <p className="text-xs text-neutral-500">
                      {msg.name} &lt;{msg.email}&gt;
                      {msg.user ? ` (user: ${msg.user.name || msg.user.email})` : " (guest)"}
                    </p>
                  </div>
                  <span className={`text-xs font-medium uppercase ${
                    msg.status === "UNREAD" ? "text-blue-500" :
                    msg.status === "RESOLVED" ? "text-green-500" : "text-neutral-400"
                  }`}>
                    {msg.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">
                  {msg.message}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  {msg.status !== "RESOLVED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => updateStatus(msg.id, msg.status === "UNREAD" ? "READ" : "RESOLVED")}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {msg.status === "UNREAD" ? "Mark Read" : "Mark Resolved"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
