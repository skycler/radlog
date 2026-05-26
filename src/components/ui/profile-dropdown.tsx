"use client";

import { useRef, useState } from "react";
import { UserIcon, SunIcon, MoonIcon } from "./icons";
import { useDarkMode } from "./dark-mode-toggle";

interface ProfileDropdownProps {
  email: string;
  onLogout: () => void;
}

export function ProfileDropdown({ email, onLogout }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { dark, toggle } = useDarkMode();

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
        title="Profile"
      >
        <UserIcon />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-foreground/10 bg-background shadow-lg py-1 z-50">
          <div className="px-3 py-2 text-sm text-foreground/50 truncate border-b border-foreground/10">
            {email}
          </div>
          <button
            onClick={toggle}
            className="w-full text-left px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors flex items-center justify-between"
          >
            <span>{dark ? "Light mode" : "Dark mode"}</span>
            <span className="text-foreground/40">
              {dark ? <SunIcon /> : <MoonIcon />}
            </span>
          </button>
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
