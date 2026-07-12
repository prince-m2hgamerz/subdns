"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidChrome } from "@/components/ui/liquid-chrome";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const [loginMode, setLoginMode] = useState<"email" | "phone">("email");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    fetch("/api/auth/phone/health")
      .then((r) => r.json())
      .then((d) => setPhoneAvailable(d.available))
      .catch(() => setPhoneAvailable(false));
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    setPhoneError("");
    if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      setPhoneError("Enter a valid number with country code (e.g., +911234567890)");
      return;
    }
    setPhoneLoading(true);
    try {
      const res = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhoneError(data.error || "Failed to send OTP");
        return;
      }
      setOtpSent(true);
      setResendCooldown(30);
    } catch {
      setPhoneError("Failed to send OTP");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setPhoneError("");
    if (!otp || otp.length < 6) {
      setPhoneError("Enter the 6-digit OTP");
      return;
    }
    setPhoneLoading(true);
    try {
      const res = await fetch("/api/auth/phone/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhoneError(data.error || "Invalid OTP");
        return;
      }
      const result = await signIn("credentials", { phone, redirect: false });
      if (result?.error) {
        setPhoneError(result.error);
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setPhoneError("Verification failed");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setOauthLoading(provider);
    setError("");
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      setError(`Failed to sign in with ${provider}`);
      setOauthLoading(null);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <LiquidChrome
        baseColor={[0.05, 0.08, 0.12]}
        speed={0.5}
        amplitude={0.35}
        className="pointer-events-none absolute inset-0 opacity-30"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      <Card className="relative w-full max-w-sm">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center justify-center gap-2">
            <Terminal className="h-6 w-6" />
            <span className="text-lg font-semibold">SubDNS</span>
          </Link>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full gap-2"
              disabled={!!oauthLoading}
              onClick={() => handleOAuthSignIn("github")}
            >
              <GitHubIcon className="h-5 w-5" />
              {oauthLoading === "github" ? "Redirecting..." : "Sign in with GitHub"}
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2"
              disabled={!!oauthLoading}
              onClick={() => handleOAuthSignIn("google")}
            >
              <GoogleIcon className="h-5 w-5" />
              {oauthLoading === "google" ? "Redirecting..." : "Sign in with Google"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-neutral-550">or continue with</span>
              </div>
            </div>
          </div>

          {phoneAvailable !== null && (
            <div className="mb-4 flex rounded-lg border p-0.5">
              <button
                type="button"
                onClick={() => setLoginMode("email")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  loginMode === "email"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-550 hover:text-neutral-900"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMode("phone")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  loginMode === "phone"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-550 hover:text-neutral-900"
                }`}
              >
                Phone
              </button>
            </div>
          )}

          {loginMode === "email" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <Link
                    href="/auth/reset-password"
                    className="text-xs text-neutral-550 hover:text-neutral-900 cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {phoneError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                  {phoneError}
                </div>
              )}

              {!otpSent ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+919999999999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <p className="text-xs text-neutral-550">
                    Include country code (e.g., +91 for India)
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full"
                    disabled={phoneLoading}
                    onClick={handleSendOtp}
                  >
                    {phoneLoading ? "Sending..." : "Send OTP"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enter OTP</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                  <p className="text-xs text-neutral-550">
                    A 6-digit code was sent to {phone}
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full"
                    disabled={phoneLoading}
                    onClick={handleVerifyOtp}
                  >
                    {phoneLoading ? "Verifying..." : "Sign In"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setPhoneError("");
                      setResendCooldown(0);
                    }}
                    className="w-full text-center text-xs text-neutral-550 hover:text-neutral-900"
                  >
                    Change phone number
                  </button>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || phoneLoading}
                    onClick={() => handleSendOtp()}
                    className="w-full text-center text-xs text-neutral-550 hover:text-neutral-900 disabled:text-neutral-400 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0
                      ? `Resend OTP in ${resendCooldown}s`
                      : "Resend OTP"}
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-neutral-550">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-medium text-neutral-900 underline dark:text-white">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
