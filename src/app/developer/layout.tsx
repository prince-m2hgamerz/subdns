import type { Metadata } from "next";
import { DeveloperShell } from "@/components/dashboard/developer-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DeveloperShell>{children}</DeveloperShell>;
}
