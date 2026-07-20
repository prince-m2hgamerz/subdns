"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Key,
  Webhook,
  BookOpen,
  Terminal,
  Code2,
  Activity,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Gauge,
  Shield,
  Play,
  Bell,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const primaryLinks = [
  { href: "/developer", icon: LayoutDashboard, label: "Overview" },
  { href: "/developer/api-keys", icon: Key, label: "API Keys" },
  { href: "/developer/webhooks", icon: Webhook, label: "Webhooks" },
  { href: "/developer/api-docs", icon: BookOpen, label: "API Docs" },
  { href: "/developer/cli", icon: Terminal, label: "CLI" },
  { href: "/developer/examples", icon: Code2, label: "Code Examples" },
  { href: "/developer/activity", icon: Activity, label: "Activity" },
];

const secondaryLinks = [
  { href: "/developer/api-health", icon: BarChart3, label: "API Health" },
  { href: "/developer/rate-limits", icon: Gauge, label: "Rate Limits" },
  { href: "/developer/sdks", icon: Shield, label: "SDKs & Libraries" },
  { href: "/developer/playground", icon: Play, label: "Playground" },
  { href: "/developer/notifications", icon: Bell, label: "Notifications" },
  { href: "/developer/changelog", icon: FileText, label: "Changelog" },
];

export function DeveloperSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string) {
    if (href === "/developer") {
      return pathname === "/developer";
    }
    return pathname.startsWith(href);
  }

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-background transition-all overflow-y-auto",
          "fixed inset-y-0 left-0 z-50 -translate-x-full md:static md:z-auto md:translate-x-0",
          mobileOpen && "translate-x-0",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <Link href="/developer" className="flex items-center gap-2 overflow-hidden">
            <Code2 className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm font-semibold">Developer</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-6 w-6"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {!collapsed && "Core"}
          </div>
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive(link.href)
                  ? "bg-card font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-card hover:text-foreground",
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          ))}

          <div className={cn("mb-2 mt-4 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground", collapsed && "mt-6")}>
            {!collapsed && "Advanced"}
          </div>
          {secondaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive(link.href)
                  ? "bg-card font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-card hover:text-foreground",
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-card",
              collapsed && "justify-center",
            )}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!collapsed && <span>User Dashboard</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
