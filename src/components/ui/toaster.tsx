"use client";

import { useToast } from "./use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-xl transition-all animate-in",
            t.variant === "destructive"
              ? "border-red-500/20 bg-red-950/90 text-red-200"
              : t.variant === "success"
              ? "border-green-500/20 bg-green-950/90 text-green-200"
              : "border-gray-alpha-200 bg-gray-50/90 text-foreground",
          )}
        >
          <div className="flex-1">
            {t.title && <p className="text-sm font-semibold">{t.title}</p>}
            {t.description && <p className="mt-1 text-sm opacity-80">{t.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
