"use client";

import { useRef, useState } from "react";
import { UserIcon } from "./icons";

interface ProfileDropdownProps {
  email: string;
  onLogout: () => void;
}

export function ProfileDropdown({ email, onLogout }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleBlur() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

  function handleFocus() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  return (
    <div className="relative" onBlur={handleBlur} onFocus={handleFocus}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full p-1.5 text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
        aria-label="Profile menu"
        aria-expanded={open}
      >
        <UserIcon />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-foreground/10 bg-background shadow-lg py-1 z-50">
          <div className="px-3 py-2 text-sm text-foreground/50 truncate border-b border-foreground/10">
            {email}
          </div>
          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full text-left px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
