"use client";

import Link from "next/link";
import { MapPinIcon, BikeIcon } from "./icons";
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

        <div className="flex items-center gap-1">
          {user && (
            <>
              <Link
                href="/rides"
                className="rounded-md p-2 text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
                title="Rides"
              >
                <MapPinIcon />
              </Link>
              <Link
                href="/bikes"
                className="rounded-md p-2 text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
                title="Bikes"
              >
                <BikeIcon />
              </Link>
            </>
          )}
          {user && onLogout && (
            <ProfileDropdown email={user.email ?? ""} onLogout={onLogout} />
          )}
        </div>
      </div>
    </header>
  );
}
