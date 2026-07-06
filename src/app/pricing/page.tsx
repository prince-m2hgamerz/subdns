import type { Metadata } from "next";
import { PricingPage } from "./pricing-client";

export const metadata: Metadata = {
  title: "Pricing — SubDNS",
  description:
    "Every developer deserves a free subdomain. Start with Bronze, upgrade when you need more. Simple pricing, no surprises.",
};

export default function Page() {
  return <PricingPage />;
}
