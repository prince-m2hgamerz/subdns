"use client";

import { useState, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { LiquidChrome } from "@/components/ui/liquid-chrome";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to send reset email");
      setSent(true);
    } catch {
      setError("Something went wrong. Try again later.");
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <LiquidChrome baseColor={[0.05, 0.08, 0.12]} speed={0.5} amplitude={0.35} className="absolute inset-0 opacity-30" />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Check your inbox</CardTitle>
            <CardDescription>
              If an account exists for {email}, we sent a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <LiquidChrome baseColor={[0.05, 0.08, 0.12]} speed={0.5} amplitude={0.35} className="absolute inset-0 opacity-30" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email and we will send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <Input
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button type="submit" variant="primary" className="w-full">
              Send reset link
            </Button>
            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
