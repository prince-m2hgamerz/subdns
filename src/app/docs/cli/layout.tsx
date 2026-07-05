import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLI Reference — SubDNS",
  description:
    "Manage subdomains and DNS from your terminal. The SubDNS CLI lets you claim, configure, and automate your corner of the internet without ever touching a browser.",
};

export default function CliDocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
