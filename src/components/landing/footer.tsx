import Link from "next/link";
import { Terminal, Moon } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterGroup {
  title: string;
  links: FooterLink[];
}

const footerLinks: FooterGroup[] = [
  {
    title: "Products",
    links: [
      { label: "Subdomains", href: "/features" },
      { label: "DNS", href: "/features" },
      { label: "CLI", href: "/docs/cli" },
      { label: "API", href: "/docs/api" },
      { label: "Enterprise", href: "/enterprise" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/docs/api" },
      { label: "Get Started", href: "/auth/register" },
      { label: "Status", href: "/status" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/privacy" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: "https://github.com", external: true },
      { label: "X / Twitter", href: "https://x.com", external: true },
      { label: "Discord", href: "https://discord.com", external: true },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Personal Sites", href: "/features" },
      { label: "Developer Portfolios", href: "/features" },
      { label: "Project Pages", href: "/features" },
      { label: "API Endpoints", href: "/features" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "CLI Reference", href: "/docs/cli" },
      { label: "REST API", href: "/docs/api" },
      { label: "SDKs & Libraries", href: "/docs" },
      { label: "Integrations", href: "/docs" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "Brand Assets", href: "/brand" },
      { label: "System Status", href: "/status" },
      { label: "Security", href: "/security" },
      { label: "GDPR", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 sm:gap-10">
          <div className="col-span-2 sm:col-span-6 lg:col-span-2 xl:col-span-2">
            <Link href="/" className="group inline-flex items-center gap-2.5 transition-all duration-200 hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-gray-100 transition-all duration-200 group-hover:border-gray-alpha-400">
                <Terminal className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight">SubDNS</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Every developer deserves a free home on the internet. Claim your corner of the web with full DNS control on m2hio.in.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title} className="sm:col-span-3 lg:col-span-2 xl:col-span-1">
              <h4 className="mb-4 text-sm font-semibold text-foreground">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                      {link.external && <span className="ml-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">↗</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SubDNS. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Moon className="h-3.5 w-3.5" />
            <span>Dark mode</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
