import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 transition-all duration-200 hover:opacity-80">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 group-hover:border-[rgba(255,255,255,0.15)]">
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px] fill-current text-foreground"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M12 2 L22 20 L2 20 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-sm font-semibold tracking-tight">SubDNS</span>
    </Link>
  );
}
