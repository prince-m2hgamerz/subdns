"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

export function AdUnit({ slot, format = "auto", className = "" }: AdUnitProps) {
  const initialized = useRef(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (consent !== "accepted") return;
    if (initialized.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initialized.current = true;
    } catch {}
  }, []);

  return (
    <div className={`flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8492704974936957"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
