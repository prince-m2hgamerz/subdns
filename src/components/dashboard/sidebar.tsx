"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Globe,
  Activity,
  Key,
  Settings,
  ChevronLeft,
  Terminal,
  Shield,
  Bug,
  BookOpen,
  Zap,
  BarChart3,
  HeartPulse,
  RefreshCw,
  Receipt,
  Code2,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const links = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/subdomains", icon: Globe, label: "Subdomains" },
  { href: "/dashboard/ddns", icon: RefreshCw, label: "Dynamic DNS" },
  { href: "/dashboard/domains", icon: Globe, label: "Custom Domains" },
  { href: "/dashboard/activity", icon: Activity, label: "Activity" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "DNS Analytics" },
  { href: "/dashboard/uptime", icon: HeartPulse, label: "Uptime" },
  { href: "/dashboard/billing", icon: Receipt, label: "Billing" },
  { href: "/dashboard/api-keys", icon: Key, label: "API Keys" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/developer", icon: Code2, label: "Developer" },
  { href: "/dashboard/ai-assistant", icon: Bot, label: "AI Assistant" },
  { href: "/dashboard/upgrade", icon: Zap, label: "Upgrade" },
  { href: "/dashboard/tutorials", icon: BookOpen, label: "Tutorials" },
  { href: "/dashboard/reports", icon: Bug, label: "My Reports" },
  { href: "/verify", icon: Shield, label: "Certificate Verify" },
];

export function Sidebar({
  isAdmin,
  mobileOpen,
  onClose,
}: {
  isAdmin: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <Terminal className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm font-semibold">SubDNS</span>}
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
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-card font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-card hover:text-foreground",
              )}
            >
              <Shield className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Admin</span>}
            </Link>
          )}

          {links.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-card font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-card hover:text-foreground",
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground",
              collapsed && "justify-center",
            )}
          >
            <ChevronLeft className="h-4 w-4 rotate-90" />
            {!collapsed && <span>Back to site</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
