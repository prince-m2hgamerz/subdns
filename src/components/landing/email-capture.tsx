"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function EmailCapture() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error("Failed")
      setStatus("success")
      setEmail("")
    } catch {
      setStatus("error")
    }
  }

  return (
    <section className="section-pad border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="display-sm">Stay in the Loop</h2>
          <p className="mt-4 text-base text-muted-foreground">
            Product updates, DNS tips, and engineering deep dives. No spam, unsubscribe anytime.
          </p>

          {status === "success" ? (
            <p className="mt-8 text-sm text-green-400">
              You&apos;re subscribed. Welcome aboard.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex-1 rounded-lg border border-border bg-black/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
              <Button type="submit" variant="primary" size="lg" disabled={status === "loading"}>
                {status === "loading" ? "Sending..." : "Subscribe"}
              </Button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-3 text-xs text-red-400">
              Something went wrong. Try again or email us directly.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
