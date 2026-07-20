import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to SubDNS with your Google or GitHub account to manage your free subdomains and DNS records.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
