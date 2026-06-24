"use client";

import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { MaximizeIcon, XMarkIcon } from "@/components/ui/icons";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  /** Additional classes on the inner content area */
  className?: string;
}

export function ChartCard({ title, children, className = "" }: ChartCardProps) {
  const [maximized, setMaximized] = useState(false);
  const [ratio, setRatio] = useState(16 / 9);
  const cardRef = useRef<HTMLDivElement>(null);

  const open = useCallback(() => {
    const el = cardRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) setRatio(rect.width / rect.height);
    }
    setMaximized(true);
  }, []);

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

  return (
    <>
      {/* Placeholder so layout doesn't collapse when card goes fixed */}
      {maximized && (
        <div
          key="placeholder"
          className="rounded-md border border-foreground/10 p-4 invisible"
          aria-hidden
        >
          <div className="h-[200px]" />
        </div>
      )}

      {/* Backdrop */}
      {maximized && (
        <div
          key="backdrop"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Card — same element in both states so children don't remount */}
      <div
        key="card"
        ref={cardRef}
        className={
          maximized
            ? "fixed z-50 overflow-auto rounded-lg border border-foreground/10 bg-background p-6 shadow-xl"
            : "rounded-md border border-foreground/10 p-4"
        }
        style={
          maximized
            ? {
                width: `min(calc(100vw - 2rem), calc((100vh - 2rem) * ${ratio}))`,
                height: `min(calc(100vh - 2rem), calc((100vw - 2rem) / ${ratio}))`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }
            : undefined
        }
      >
        <div
          className={`flex items-center justify-between ${maximized ? "mb-4" : "mb-3"}`}
        >
          <h3 className="text-sm font-semibold text-foreground/60">{title}</h3>
          <button
            onClick={maximized ? close : open}
            className={`p-1 rounded hover:bg-foreground/10 transition-colors ${
              maximized
                ? "text-foreground/50 hover:text-foreground"
                : "text-foreground/30 hover:text-foreground/60"
            }`}
            title={maximized ? "Close" : "Maximize"}
          >
            {maximized ? <XMarkIcon /> : <MaximizeIcon />}
          </button>
        </div>
        <div className={className}>{children}</div>
      </div>
    </>
  );
}
