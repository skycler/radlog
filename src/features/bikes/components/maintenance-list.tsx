"use client";

import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { getRideStatsBetweenDates } from "../actions";

interface Entry {
  id: string;
  date: string;
  maintenance_note: string | null;
}

interface Stats {
  days: number;
  rideCount: number;
  totalDistanceKm: number;
  totalElevationM: number;
}

export function MaintenanceList({
  entries,
  bikeId,
}: {
  entries: Entry[];
  bikeId: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, startTransition] = useTransition();

  const fetchStats = useCallback(
    (ids: Set<string>) => {
      if (ids.size !== 2) {
        setStats(null);
        return;
      }
      const selectedEntries = entries.filter((e) => ids.has(e.id));
      const [a, b] = selectedEntries;
      startTransition(async () => {
        try {
          const result = await getRideStatsBetweenDates(bikeId, a.date, b.date);
          setStats(result);
        } catch {
          setStats(null);
        }
      });
    },
    [entries, bikeId],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 2) {
        next.add(id);
      } else {
        const [first] = next;
        next.delete(first);
        next.add(id);
      }
      fetchStats(next);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Summary panel */}
      {selected.size === 2 && (
        <div className="rounded-md border border-foreground/20 bg-foreground/[0.02] px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground/70">
              Between selected events
            </h2>
            <button
              onClick={() => {
                setSelected(new Set());
                setStats(null);
              }}
              className="text-xs text-foreground/40 hover:text-foreground transition-colors"
            >
              Clear selection
            </button>
          </div>
          {pending ? (
            <p className="mt-2 text-sm text-foreground/40">Loading...</p>
          ) : stats ? (
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-2xl font-bold">{stats.days}</p>
                <p className="text-xs text-foreground/50">days</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rideCount}</p>
                <p className="text-xs text-foreground/50">rides</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDistanceKm}</p>
                <p className="text-xs text-foreground/50">km</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalElevationM}</p>
                <p className="text-xs text-foreground/50">m elevation</p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Hint */}
      {entries.length >= 2 && selected.size < 2 && (
        <p className="text-xs text-foreground/40">
          Select two entries to compare activity between them.
        </p>
      )}

      {/* Entry list */}
      <ul className="space-y-3">
        {entries.map((entry) => {
          const isSelected = selected.has(entry.id);
          return (
            <li
              key={entry.id}
              onClick={() => toggle(entry.id)}
              className={`cursor-pointer rounded-md border px-4 py-3 transition-colors ${
                isSelected
                  ? "border-foreground/40 bg-foreground/5"
                  : "border-foreground/10 hover:border-foreground/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded border text-[10px] transition-colors ${
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/30"
                    }`}
                  >
                    {isSelected && "✓"}
                  </span>
                  <span className="text-sm text-foreground/50">
                    {entry.date}
                  </span>
                </div>
                <Link
                  href={`/rides/${entry.id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-foreground/40 hover:text-foreground transition-colors"
                >
                  View ride
                </Link>
              </div>
              <p className="mt-1 pl-6 text-foreground">
                {entry.maintenance_note}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
