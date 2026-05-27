"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { MaximizeIcon, XMarkIcon } from "@/components/ui/icons";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  /** Additional classes on the inner content area */
  className?: string;
}

export function ChartCard({ title, children, className = "" }: ChartCardProps) {
  const [maximized, setMaximized] = useState(false);

  const close = useCallback(() => setMaximized(false), []);

  useEffect(() => {
    if (!maximized) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [maximized, close]);

  if (maximized) {
    return (
      <>
        {/* Placeholder so layout doesn't collapse */}
        <div className="rounded-md border border-foreground/10 p-4 invisible" aria-hidden>
          <div className="h-[200px]" />
        </div>
        {/* Overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={close}>
          <div
            className="relative w-[90vw] max-w-5xl max-h-[90vh] overflow-auto rounded-lg border border-foreground/10 bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground/60">{title}</h3>
              <button
                onClick={close}
                className="p-1 rounded hover:bg-foreground/10 text-foreground/50 hover:text-foreground transition-colors"
                title="Close"
              >
                <XMarkIcon />
              </button>
            </div>
            <div className={className}>{children}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="rounded-md border border-foreground/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground/60">{title}</h3>
        <button
          onClick={() => setMaximized(true)}
          className="p-1 rounded hover:bg-foreground/10 text-foreground/30 hover:text-foreground/60 transition-colors"
          title="Maximize"
        >
          <MaximizeIcon />
        </button>
      </div>
      <div className={className}>{children}</div>
    </div>
  );
}
