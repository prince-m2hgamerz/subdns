"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const ADSENSE_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8492704974936957";

function loadAdSense() {
  if (document.querySelector(`script[src="${ADSENSE_SRC}"]`)) return;
  const script = document.createElement("script");
  script.src = ADSENSE_SRC;
  script.async = true;
  document.head.appendChild(script);
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (consent === "accepted") {
      loadAdSense();
    } else if (!consent) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = useCallback(() => {
    localStorage.setItem("cookie-consent", "accepted");
    loadAdSense();
    setVisible(false);
  }, []);

  const reject = useCallback(() => {
    localStorage.setItem("cookie-consent", "rejected");
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          This site uses cookies and similar technologies to improve your
          experience. By continuing, you agree to our{" "}
          <Link href="/legal/cookies" className="underline hover:text-foreground">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={reject}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Reject All
          </button>
          <button
            onClick={accept}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
