"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Terminal, Globe, BookText, Monitor, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tutorials = [
  {
    title: "Getting Started",
    description: "Claim your first subdomain and go live in minutes.",
    icon: BookOpen,
    href: "/docs/tutorials/getting-started",
    duration: "5 min",
    level: "Beginner",
  },
  {
    title: "How SubDNS Works",
    description: "Understand the two-step partnership model — DNS vs hosting.",
    icon: Globe,
    href: "/docs/tutorials/how-subdns-works",
    duration: "3 min",
    level: "Beginner",
  },
  {
    title: "Platform Setup Guide",
    description: "Add your subdomain to Vercel, Netlify, Railway, and more.",
    icon: Monitor,
    href: "/docs/tutorials/platform-guide",
    duration: "10 min",
    level: "Beginner",
  },
  {
    title: "DNS Management",
    description: "Manage A, CNAME, TXT records via dashboard, CLI, or API.",
    icon: BookText,
    href: "/docs/tutorials/dns-management",
    duration: "8 min",
    level: "Intermediate",
  },
  {
    title: "CLI Guide",
    description: "Install and use the SubDNS CLI to manage everything from your terminal.",
    icon: Terminal,
    href: "/docs/tutorials/cli-guide",
    duration: "6 min",
    level: "Intermediate",
  },
];

export default function TutorialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tutorials</h1>
        <p className="text-sm text-muted-foreground">
          Learn how to use SubDNS step by step
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tutorials.map((tutorial) => {
          const Icon = tutorial.icon;
          return (
            <Link key={tutorial.href} href={tutorial.href}>
              <Card className="group h-full cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{tutorial.title}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {tutorial.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {tutorial.duration}
                      </Badge>
                      <Badge
                        variant={tutorial.level === "Beginner" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {tutorial.level}
                      </Badge>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Need more help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Full documentation and API reference are available on our docs page.
          </p>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View full documentation
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
