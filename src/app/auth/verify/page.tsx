"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";
import { LiquidChrome } from "@/components/ui/liquid-chrome";

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <LiquidChrome baseColor={[0.05, 0.08, 0.12]} speed={0.5} amplitude={0.35} className="pointer-events-none absolute inset-0 opacity-30" />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            A verification link has been sent to your email address. Click the
            link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-sm text-neutral-500">
            Did not receive the email? Check your spam folder or try{" "}
            <Link
              href="/auth/login"
              className="text-neutral-900 underline dark:text-white"
            >
              signing in
            </Link>{" "}
            again to resend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
