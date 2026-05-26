"use client";

import Link from "next/link";
import { DarkModeToggle } from "./dark-mode-toggle";
import { ProfileDropdown } from "./profile-dropdown";

interface HeaderProps {
  user?: { email?: string } | null;
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="border-b border-foreground/10">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-foreground">
          Radlog
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <>
              <Link
                href="/rides"
                className="rounded-md px-3 py-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Rides
              </Link>
              <Link
                href="/bikes"
                className="rounded-md px-3 py-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Bikes
              </Link>
            </>
          )}
          <DarkModeToggle />
          {user && onLogout && (
            <ProfileDropdown email={user.email ?? ""} onLogout={onLogout} />
          )}
        </div>
      </div>
    </header>
  );
}
