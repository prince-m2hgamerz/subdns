import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { StatusContent } from "./status-content";

export const metadata: Metadata = {
  title: "Status — SubDNS",
  description: "Real-time status and uptime for your free corner of the internet. Every service, every check, live and transparent.",
};

export default function StatusPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <StatusContent />
      </main>
      <Footer />
    </>
  );
}
