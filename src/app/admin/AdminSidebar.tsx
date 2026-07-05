"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Globe,
  Server,
  Lock,
  Activity,
  Settings,
  Shield,
  LifeBuoy,
  Menu,
  X,
  ArrowLeft,
  Bug,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/subdomains", label: "Subdomains", icon: Globe },
  { href: "/admin/domains", label: "Domains", icon: Server },
  { href: "/admin/reserved", label: "Reserved Names", icon: Lock },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/plans", label: "Plans", icon: DollarSign },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/security", label: "Security", icon: Shield },
  { href: "/admin/contact", label: "Contact", icon: LifeBuoy },
  { href: "/admin/reports", label: "Reports", icon: Bug },
];

export default function AdminSidebar({
  userName,
  userEmail,
}: {
  userName?: string | null;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-950 text-white lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex w-64 flex-col bg-neutral-950 text-white transition-transform",
          "fixed inset-y-0 left-0 z-40 lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-neutral-800 px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-bold">
            S
          </div>
          <div>
            <p className="text-sm font-semibold">SubDNS</p>
            <p className="text-[11px] text-neutral-500">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200",
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-neutral-800 px-4 py-4">
          <Link
            href="/dashboard"
            className="mb-3 flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 rounded-lg bg-neutral-900 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-700 text-xs font-medium uppercase">
              {(userName || userEmail || "A")[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName || "Admin"}</p>
              {userEmail && (
                <p className="truncate text-xs text-neutral-500">{userEmail}</p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
