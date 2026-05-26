"use client";

import { useRef, useState, type ReactNode } from "react";

export function Popover({
  trigger,
  children,
}: {
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleBlur() {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  }

  function handleFocus() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  return (
    <div className="relative inline-flex" onBlur={handleBlur} onFocus={handleFocus}>
      <button
        onClick={() => setOpen((p) => !p)}
        type="button"
        className="contents"
      >
        {trigger}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-[180px] rounded-md border border-foreground/10 bg-background shadow-lg p-2">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
