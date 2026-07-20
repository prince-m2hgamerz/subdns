"use client";

import { useState } from "react";
import { DeveloperSidebar } from "./developer-sidebar";
import { DeveloperNavbar } from "./developer-navbar";
import { LiquidChrome } from "@/components/ui/liquid-chrome";

export function DeveloperShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-dvh overflow-hidden bg-background md:h-screen">
      <LiquidChrome
        baseColor={[0.04, 0.06, 0.1]}
        speed={0.4}
        amplitude={0.3}
        interactive={false}
        className="pointer-events-none absolute inset-0 opacity-15"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
      <DeveloperSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative flex flex-1 flex-col min-h-0">
        <DeveloperNavbar onMobileToggle={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 min-h-0">{children}</main>
      </div>
    </div>
  );
}
