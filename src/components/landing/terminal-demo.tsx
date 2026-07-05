"use client";

import { useEffect, useState } from "react";
import { CheckCircle, ChevronRight, Terminal } from "lucide-react";

interface Line {
  text: string;
  type: "command" | "output" | "success" | "info";
  delay: number;
}

const script: Line[] = [
  { text: "subdns login subdns_xxxxxxxxxxxx", type: "command", delay: 0 },
  { text: "✓ Authenticated as user@example.com", type: "success", delay: 800 },
  { text: "", type: "output", delay: 200 },
  { text: "subdns claim my-project", type: "command", delay: 400 },
  { text: "✓ Claimed my-project.m2hio.in", type: "success", delay: 900 },
  { text: "  DNS: managed  |  SSL: auto  |  Proxy: cloudflare", type: "info", delay: 300 },
  { text: "", type: "output", delay: 200 },
  { text: "subdns dns add my-project --type A --content 76.76.21.21", type: "command", delay: 500 },
  { text: "✓ DNS record added (A → 76.76.21.21)", type: "success", delay: 800 },
  { text: "", type: "output", delay: 200 },
  { text: "subdns list", type: "command", delay: 400 },
  { text: "  my-project.m2hio.in    A    76.76.21.21", type: "output", delay: 600 },
  { text: "  api.m2hio.in           CNAME  my-app.vercel.app", type: "output", delay: 200 },
  { text: "  blog.m2hio.in          CNAME  blog.vercel.app", type: "output", delay: 200 },
];

export function TerminalDemo() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [cursorLine, setCursorLine] = useState<number | null>(0);

  useEffect(() => {
    let totalDelay = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    script.forEach((line, i) => {
      totalDelay += line.delay;
      const t = setTimeout(() => {
        setVisibleLines(i + 1);
        if (line.type === "command") {
          setCursorLine(i);
        } else {
          setCursorLine(null);
        }
      }, totalDelay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <div className="ml-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" />
              <span>SubDNS CLI — bash</span>
            </div>
          </div>
          <div className="p-5 font-mono text-sm leading-relaxed">
            {script.slice(0, visibleLines).map((line, i) => {
              if (!line.text && line.type === "output") {
                return <div key={i} className="h-3" />;
              }
              return (
                <div key={i} className="flex items-start gap-2">
                  {line.type === "command" && (
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  )}
                  {line.type === "success" && (
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  )}
                  {line.type === "info" && (
                    <span className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  {line.type === "output" && (
                    <span className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span
                    className={
                      line.type === "command"
                        ? "text-foreground"
                        : line.type === "success"
                          ? "text-success"
                          : line.type === "info"
                            ? "text-muted-foreground"
                            : "text-muted-foreground"
                    }
                  >
                    {line.text}
                    {line.type === "command" && cursorLine === i && (
                      <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-primary" />
                    )}
                  </span>
                </div>
              );
            })}

            {visibleLines < script.length && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground/60">
                <span className="inline-block h-3 w-2 animate-pulse rounded-sm bg-muted-foreground/40" />
                <span className="animate-pulse">Waiting for next command...</span>
              </div>
            )}
            {visibleLines >= script.length && (
              <div className="mt-3 flex items-center gap-2 text-xs text-success/80">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>All done. Your corner of the internet is ready.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
