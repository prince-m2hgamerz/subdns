"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export function DocsToc() {
  const [headings, setHeadings] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const content = document.querySelector("main");
    if (!content) return;

    const elements = content.querySelectorAll("h2[id], h3[id]");
    const entries: TocEntry[] = [];
    elements.forEach((el) => {
      const id = el.getAttribute("id");
      const text = el.textContent || "";
      const level = el.tagName === "H3" ? 3 : 2;
      if (id && text) {
        entries.push({ id, text, level });
      }
    });
    setHeadings(entries);

    if (entries.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    entries.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-56 shrink-0 overflow-y-auto border-l border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col gap-4 px-4 py-8">
        <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          On This Page
        </h4>
        <ul className="flex flex-col gap-1">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(heading.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    window.history.pushState(null, "", `#${heading.id}`);
                  }
                }}
                className={cn(
                  "block truncate rounded px-3 py-1 text-sm transition-colors",
                  heading.level === 3 ? "pl-6" : "pl-3",
                  activeId === heading.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
