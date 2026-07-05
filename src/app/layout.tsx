import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/components/providers";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SubDNS — Free Subdomains for Developers",
    template: "%s — SubDNS",
  },
  description:
    "Claim your free subdomain on m2hio.in instantly. Manage DNS records, enable Cloudflare proxy, and deploy your projects in seconds.",
  keywords: ["subdomain", "dns", "cloudflare", "free subdomain", "m2hio", "developer tools"],
  authors: [{ name: "SubDNS" }],
  metadataBase: new URL("https://subdns.m2hio.in"),
  openGraph: {
    title: "SubDNS — Free Subdomains for Developers",
    description: "Claim your free subdomain on m2hio.in instantly.",
    url: "https://subdns.m2hio.in",
    siteName: "SubDNS",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SubDNS — Free Subdomains for Developers",
    description: "Claim your free subdomain on m2hio.in instantly.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <Providers>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
