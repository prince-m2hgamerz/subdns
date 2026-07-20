"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BookOpen, Code, Terminal, Compass, Network, Server, GraduationCap, Package } from "lucide-react";

const navItems = [
  {
    section: "Getting Started",
    items: [
      { href: "/docs", label: "Overview", icon: BookOpen, exact: true },
      { href: "/docs/tutorials/getting-started", label: "Quick Start", icon: Compass },
      { href: "/docs/tutorials/how-subdns-works", label: "How SubDNS Works", icon: Server },
    ],
  },
  {
    section: "Guides",
    items: [
      { href: "/docs/tutorials/platform-guide", label: "Platform Guide", icon: GraduationCap },
      { href: "/docs/tutorials/dns-management", label: "DNS Management", icon: Network },
      { href: "/docs/tutorials/cli-guide", label: "CLI Guide", icon: Terminal },
    ],
  },
  {
    section: "Reference",
    items: [
      { href: "/docs/api", label: "API Reference", icon: Code },
      { href: "/docs/cli", label: "CLI Reference", icon: Terminal },
      { href: "/docs/sdk", label: "SDK Reference", icon: Package },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) || pathname === href;
  };

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex flex-col gap-6 px-4 py-8">
        {navItems.map((section) => (
          <div key={section.section}>
            <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.section}
            </h4>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive(item.href, item.exact)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
