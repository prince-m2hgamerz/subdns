import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { TerminalDemo } from "@/components/landing/terminal-demo";
import { RecentlyShipped } from "@/components/landing/recently-shipped";
import { Stats } from "@/components/landing/stats";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <TerminalDemo />
      <RecentlyShipped />
      <Stats />
      <Footer />
    </>
  );
}
