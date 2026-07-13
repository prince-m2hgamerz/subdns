"use client";

import Link from "next/link";
import { Menu, X, ChevronDown, ExternalLink, LayoutDashboard, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

const products = [
  { label: "Subdomains", href: "/features", desc: "Claim your free corner of the internet" },
  { label: "DNS", href: "/features", desc: "Full DNS control on the global edge" },
  { label: "CLI", href: "/docs/cli", desc: "Manage your subdomains from the terminal" },
  { label: "API", href: "/docs/api", desc: "Build and automate with our REST API" },
];

const resources = [
  { label: "Documentation", href: "/docs", desc: "Guides, CLI docs, and API reference" },
  { label: "Blog", href: "/blog", desc: "News, guides, and product updates" },
  { label: "GitHub", href: "https://github.com", desc: "Open source, contributions, and ideas", external: true },
  { label: "Status", href: "/status", desc: "Real-time service status" },
  { label: "Changelog", href: "/changelog", desc: "What's new and what's changed" },
];

function Dropdown({
  label,
  items,
  open,
  onToggle,
  onClose,
}: {
  label: string;
  items: { label: string; href: string; desc?: string; external?: boolean }[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className={cn(
          "group flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm transition-all duration-200",
          open
            ? "text-foreground bg-gray-100"
            : "text-muted-foreground hover:text-foreground hover:bg-gray-100"
        )}
      >
        <span className="relative">
          {label}
          <span className="absolute -bottom-px left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 rounded-lg border border-border bg-background p-2">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex cursor-pointer items-center gap-3 rounded px-3 py-2.5 text-sm transition-all duration-200 hover:bg-gray-100",
                item.external ? "justify-between" : ""
              )}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <div>
                <div className="font-medium text-foreground transition-colors duration-200">{item.label}</div>
                {item.desc && (
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                )}
              </div>
              {item.external && <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) navRef.current.dataset.navOpen = String(open);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
      <nav
        ref={navRef}
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-500",
          scrolled
            ? "bg-[rgba(255,255,255,0.04)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />

          <div className="hidden items-center gap-0.5 md:flex">
            <Dropdown
              label="Products"
              items={products}
              open={productsOpen}
              onToggle={() => { setProductsOpen(!productsOpen); setResourcesOpen(false); }}
              onClose={() => setProductsOpen(false)}
            />
            <Dropdown
              label="Resources"
              items={resources}
              open={resourcesOpen}
              onToggle={() => { setResourcesOpen(!resourcesOpen); setProductsOpen(false); }}
              onClose={() => setResourcesOpen(false)}
            />
            <Link
              href="/enterprise"
              className="group relative cursor-pointer rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-gray-100"
            >
              Enterprise
              <span className="absolute bottom-1 left-3 h-px w-[calc(100%-1.5rem)] scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link
              href="/about"
              className="group relative cursor-pointer rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-gray-100"
            >
              About
              <span className="absolute bottom-1 left-3 h-px w-[calc(100%-1.5rem)] scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link
              href="/pricing"
              className="group relative cursor-pointer rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-gray-100"
            >
              Pricing
              <span className="absolute bottom-1 left-3 h-px w-[calc(100%-1.5rem)] scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link
              href="/contact"
              className="group relative cursor-pointer rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-gray-100"
            >
              Contact
              <span className="absolute bottom-1 left-3 h-px w-[calc(100%-1.5rem)] scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
            <Link
              href="/verify"
              className="group relative cursor-pointer rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-gray-100"
            >
              Verify
              <span className="absolute bottom-1 left-3 h-px w-[calc(100%-1.5rem)] scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/demo">
            <Button variant="secondary" size="nav">Get a Demo</Button>
          </Link>
          {session ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="nav" className="gap-2">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="nav" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="nav">Log In</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="nav">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="flex cursor-pointer items-center rounded-lg p-2 hover:bg-gray-100 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-sm border-l border-border bg-background shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto px-5 pb-8 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <Logo />
            <button
              onClick={() => setOpen(false)}
              className="flex cursor-pointer items-center rounded-lg p-2 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="space-y-0.5">
                <Link
                  href="/pricing"
                  onClick={() => setOpen(false)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-gray-100"
                >
                  Pricing
                </Link>
                <Link
                  href="/enterprise"
                  onClick={() => setOpen(false)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-gray-100"
                >
                  Enterprise
                </Link>
                <Link
                  href="/about"
                  onClick={() => setOpen(false)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-gray-100"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-gray-100"
                >
                  Contact
                </Link>
                <Link
                  href="/verify"
                  onClick={() => setOpen(false)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-gray-100"
                >
                  Verify
                </Link>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Products
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-0.5">
                {products.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-gray-100"
                  >
                    <div>
                      <div className="font-medium text-foreground">{item.label}</div>
                      {item.desc && <div className="text-xs text-muted-foreground">{item.desc}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Resources
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-0.5">
                {resources.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-gray-100",
                      item.external ? "justify-between" : ""
                    )}
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    <div>
                      <div className="font-medium text-foreground">{item.label}</div>
                      {item.desc && <div className="text-xs text-muted-foreground">{item.desc}</div>}
                    </div>
                    {item.external && <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-6">
            <Link href="/demo" onClick={() => setOpen(false)}>
              <Button variant="secondary" size="sm" className="w-full gap-2">
                <Monitor className="h-3.5 w-3.5" />
                Get a Demo
              </Button>
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full gap-2">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut()} className="w-full">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Log In</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
