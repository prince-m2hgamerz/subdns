import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Create your free SubDNS account to claim a subdomain under subdns.m2hio.in and start managing DNS records instantly.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
