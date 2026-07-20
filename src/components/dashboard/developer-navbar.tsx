"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Menu, User } from "lucide-react";
import Link from "next/link";

export function DeveloperNavbar({
  onMobileToggle,
}: {
  onMobileToggle?: () => void;
}) {
  const { data: session } = useSession();

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={onMobileToggle}>
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-sm font-medium text-muted-foreground">Developer</h2>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="ml-2 hidden gap-1.5 md:inline-flex">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>User Dashboard</span>
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <User className="h-4 w-4" />
          </Button>
        </Link>
        <Avatar className="h-8 w-8 ring-1 ring-gray-alpha-200">
          <AvatarImage src={session?.user?.image ?? undefined} />
          <AvatarFallback className="text-xs">{initials ?? "U"}</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
