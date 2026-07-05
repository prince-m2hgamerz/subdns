"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { DashboardNavbar } from "./navbar";
import { LiquidChrome } from "@/components/liquid-chrome";

export function DashboardShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-background md:h-screen">
      <LiquidChrome
        baseColor={[0.04, 0.06, 0.1]}
        speed={0.4}
        amplitude={0.3}
        interactive={false}
        className="absolute inset-0 opacity-15"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
      <Sidebar isAdmin={isAdmin} mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <DashboardNavbar onMobileToggle={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
