import type { ReactNode } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { DocsSidebar } from "@/components/docs/sidebar";
import { DocsToc } from "@/components/docs/toc";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 pt-16">
        <DocsSidebar />
        <main className="min-w-0 flex-1 px-6 py-12">{children}</main>
        <DocsToc />
      </div>
      <Footer />
    </div>
  );
}
