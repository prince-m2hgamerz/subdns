import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Certificate",
  description:
    "Look up SSL/TLS certificate details for any subdomain managed by SubDNS. Verify issuance, expiry, and configuration.",
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
