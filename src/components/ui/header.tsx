"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPinIcon, BikeIcon } from "./icons";
import { ProfileDropdown } from "./profile-dropdown";

interface HeaderProps {
  user?: { email?: string } | null;
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const pathname = usePathname();
  const isRides = pathname.startsWith("/rides");
  const isBikes = pathname.startsWith("/bikes");

  const baseClass = "rounded-md p-2 transition-colors";
  const activeClass = `${baseClass} text-accent bg-accent/10`;
  const inactiveClass = `${baseClass} text-foreground/60 hover:text-foreground hover:bg-foreground/5`;

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
                className={isRides ? activeClass : inactiveClass}
                title="Rides"
              >
                <MapPinIcon />
              </Link>
              <Link
                href="/bikes"
                className={isBikes ? activeClass : inactiveClass}
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
