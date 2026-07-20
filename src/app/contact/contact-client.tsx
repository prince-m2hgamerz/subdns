"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CheckCircle, Terminal, Mail, BookOpen, MessageSquare, Clock } from "lucide-react";

export function ContactPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-8">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h2 className="text-xl font-semibold">Message Sent!</h2>
            <p className="mt-2 text-sm text-neutral-500">
              We&apos;ll get back to you as soon as possible.
            </p>
            <Link href="/" className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Back to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <Terminal className="h-5 w-5" />
          SubDNS
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Get in Touch</h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Whether you need help configuring DNS records, have questions about your subdomain, want to report abuse, or are evaluating our Enterprise plan — we respond to every inquiry within one business day.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col items-center rounded-lg border border-border bg-card p-4 text-center">
              <Mail className="mb-2 h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Email Support</span>
              <span className="mt-1 text-sm text-foreground">subdns@m2hio.in</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-border bg-card p-4 text-center">
              <BookOpen className="mb-2 h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Documentation</span>
              <span className="mt-1 text-sm text-foreground">docs.subdns.m2hio.in</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-border bg-card p-4 text-center">
              <Clock className="mb-2 h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Response Time</span>
              <span className="mt-1 text-sm text-foreground">&lt; 24 hours</span>
            </div>
          </div>
        </div>
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>
              Have a question about subdomains, need help with DNS configuration, or
              interested in our Enterprise plan? Use the form below and we will get
              back to you within 1 business day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  required
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  required
                  placeholder="How can we help?"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe your question or issue..."
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
