"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSupportPage() {
  const { data: session, status: authStatus } = useSession();

  if (authStatus === "unauthenticated") redirect("/auth/login");

  if (authStatus === "loading") {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-sm text-neutral-500">Contact and support module</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Module</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/30">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Support module is not yet active
            </p>
            <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
              The contact form and ticketing system are under development.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="opacity-60">
        <CardHeader>
          <CardTitle>Contact Form Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input placeholder="How can we help?" disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <textarea
              disabled
              placeholder="Describe your issue..."
              className="flex h-24 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950"
            />
          </div>
          <div className="flex justify-end">
            <Button variant="primary" disabled>
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Getting Help</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-neutral-500">
            While the support module is being built, here are ways to get help:
          </p>
          <ul className="list-inside list-disc space-y-1 text-neutral-600 dark:text-neutral-400">
            <li>
              Check the{" "}
              <a href="/docs" className="text-blue-600 hover:underline dark:text-blue-400">
                documentation
              </a>{" "}
              for guides and FAQs.
            </li>
            <li>
              Report issues on the{" "}
              <a
                href="https://github.com/your-org/your-repo/issues"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                GitHub repository
              </a>
              .
            </li>
            <li>Contact your administrator directly for urgent matters.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
