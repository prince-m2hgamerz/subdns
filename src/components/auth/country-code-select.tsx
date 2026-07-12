"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { countries, getDefaultCountry, type Country } from "@/lib/countries";

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = countries.find((c) => c.dial === value) ?? getDefaultCountry();

  const filtered = countries.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const trigger = (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 items-center gap-1.5 rounded-xl border border-gray-250 bg-gray-100 px-3 py-2 text-sm",
        "transition-all duration-200",
        "hover:bg-gray-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      )}
    >
      <span className="text-base leading-none">{selected.flag}</span>
      <span className="text-foreground">{selected.dial}</span>
      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
    </button>
  );

  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [listMaxHeight, setListMaxHeight] = useState(256);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = 12;

      const dropdownW = Math.min(320, vw - margin * 2);

      let left = rect.left;
      if (left + dropdownW > vw - margin) {
        left = vw - dropdownW - margin;
      }
      if (left < margin) left = margin;

      const gap = 4;
      const searchH = 44;
      const below = vh - rect.bottom - gap;
      const above = rect.top - gap;

      const openUpward = below < 260 && above > below;

      const available = openUpward ? above : below;
      const maxList = Math.min(256, Math.max(150, available - searchH - 8));

      const top = openUpward
        ? rect.top - maxList - searchH - 8 - gap
        : rect.bottom + gap;

      setDropdownStyle({
        position: "fixed",
        top: `${Math.max(margin, top)}px`,
        left: `${left}px`,
        zIndex: 9999,
        width: `${dropdownW}px`,
      });
      setListMaxHeight(maxList);
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {trigger}
      {open && mounted && createPortal(
        <div
          style={dropdownStyle}
          className="rounded-xl border border-gray-250 bg-card shadow-lg"
        >
          <div className="flex items-center gap-2 border-b border-gray-250 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                  setSearch("");
                }
              }}
            />
          </div>
          <div
            className="overflow-y-auto p-1"
            style={{ maxHeight: listMaxHeight, overscrollBehavior: "contain" }}
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No countries found
              </div>
            ) : (
              filtered.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country.dial);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    "hover:bg-gray-100",
                    country.dial === value && "bg-gray-100 font-medium",
                  )}
                >
                  <span className="text-base leading-none">{country.flag}</span>
                  <span className="flex-1 text-left">{country.name}</span>
                  <span className="text-muted-foreground">{country.dial}</span>
                  {country.dial === value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export { type Country };
