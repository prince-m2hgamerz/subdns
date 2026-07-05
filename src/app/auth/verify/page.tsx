import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verify Email — SubDNS",
};

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
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
