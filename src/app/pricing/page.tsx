import type { Metadata } from "next";
import { PricingPage } from "./pricing-client";

export const metadata: Metadata = {
  title: "Pricing — SubDNS",
  description:
    "Every developer deserves a free subdomain. Start with Bronze, upgrade when you need more. Simple pricing, no surprises.",
  alternates: { canonical: "https://subdns.m2hio.in/pricing" },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "SubDNS Subdomain Plans",
    description: "Every developer deserves a free subdomain. Start with Bronze, upgrade when you need more.",
    url: "https://subdns.m2hio.in/pricing",
    offers: [
      { "@type": "Offer", name: "Bronze", price: "0", priceCurrency: "USD", description: "2 subdomains, basic DNS" },
      { "@type": "Offer", name: "Silver", price: "5", priceCurrency: "USD", description: "10 subdomains, Cloudflare proxy" },
      { "@type": "Offer", name: "Gold", price: "15", priceCurrency: "USD", description: "Unlimited subdomains, priority support" },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PricingPage />;
    </>
  );
}
