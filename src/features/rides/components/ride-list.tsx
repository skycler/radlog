"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  PencilIcon,
  TrashIcon,
  SortAscIcon,
  SortDescIcon,
  FilterIcon,
  ChevronDownIcon,
} from "@/components/ui/icons";
import { Popover } from "@/components/ui/popover";
import { deleteRide } from "../actions";

interface Ride {
  id: string;
  date: string;
  distance_km: number;
  elevation_gain_m: number;
  personal_note: string | null;
  bikes: { name: string } | null;
}

interface Bike {
  id: string;
  name: string;
}

export function RideList({
  rides,
  bikes,
  filtered,
}: {
  rides: Ride[];
  bikes: Bike[];
  filtered?: boolean;
}) {
  const [deleteTarget, setDeleteTarget] = useState<Ride | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortBy = searchParams.get("sort") ?? "date";
  const sortOrder = searchParams.get("order") ?? "desc";
  const selectedBikes = searchParams.get("bikes")?.split(",").filter(Boolean) ?? [];

  const update = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      if (params.get("sort") === "date") params.delete("sort");
      if (params.get("order") === "desc") params.delete("order");
      const qs = params.toString();
      router.push(qs ? `/rides?${qs}` : "/rides");
    },
    [router, searchParams],
  );

  function toggleSort(field: string) {
    if (sortBy === field) {
      update({ sort: field, order: sortOrder === "desc" ? "asc" : "desc" });
    } else {
      update({ sort: field, order: "desc" });
    }
  }

  function toggleBike(bikeId: string) {
    const next = selectedBikes.includes(bikeId)
      ? selectedBikes.filter((b) => b !== bikeId)
      : [...selectedBikes, bikeId];
    update({ bikes: next.join(",") });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteRide(deleteTarget.id);
    if (result?.error) {
      setError(result.error);
    }
    setDeleteTarget(null);
  }

  if (rides.length === 0 && !filtered) {
    return (
      <div className="rounded-md border border-foreground/10 px-4 py-8 text-center">
        <p className="text-foreground/60">No rides yet.</p>
        <Link href="/rides/new">
          <Button className="mt-4">Log your first ride</Button>
        </Link>
      </div>
    );
  }

  const isSorted = (field: string) => sortBy === field;
  const hasDateFilter = searchParams.has("from") || searchParams.has("to");
  const hasDistanceFilter = searchParams.has("dist_from") || searchParams.has("dist_to");
  const hasElevationFilter = searchParams.has("elev_from") || searchParams.has("elev_to");
  const hasBikeFilter = selectedBikes.length > 0;

  const activeClass = "text-accent-secondary";
  const inactiveClass = "text-foreground/30 hover:text-foreground/60";

  return (
    <>
      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-md border border-foreground/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground/10 text-left text-foreground/60">
              {/* Date */}
              <th className="px-4 py-2 font-medium">
                <div className="flex items-center gap-1">
                  Date
                  <button
                    onClick={() => toggleSort("date")}
                    className={`transition-colors ${isSorted("date") ? activeClass : inactiveClass}`}
                    aria-label="Sort by date"
                    title="Sort by date"
                  >
                    {isSorted("date") && sortOrder === "asc" ? <SortAscIcon /> : <SortDescIcon />}
                  </button>
                  <Popover
                    trigger={
                      <span
                        className={`transition-colors cursor-pointer ${hasDateFilter ? activeClass : inactiveClass}`}
                        aria-label="Filter by date"
                        title="Filter by date"
                      >
                        <FilterIcon />
                      </span>
                    }
                  >
                    {(close) => (
                      <RangeFilter
                        type="date"
                        fromValue={searchParams.get("from") ?? ""}
                        toValue={searchParams.get("to") ?? ""}
                        fromParam="from"
                        toParam="to"
                        onApply={(from, to) => {
                          update({ from, to });
                          close();
                        }}
                      />
                    )}
                  </Popover>
                </div>
              </th>

              {/* Bike */}
              <th className="px-4 py-2 font-medium">
                <div className="flex items-center gap-1">
                  Bike
                  <Popover
                    trigger={
                      <span
                        className={`transition-colors cursor-pointer ${hasBikeFilter ? activeClass : inactiveClass}`}
                        aria-label="Filter by bike"
                        title="Filter by bike"
                      >
                        <ChevronDownIcon />
                      </span>
                    }
                  >
                    {() => (
                      <div className="flex flex-col gap-1">
                        {bikes.map((bike) => (
                          <label
                            key={bike.id}
                            className="flex items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-foreground/5 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBikes.includes(bike.id)}
                              onChange={() => toggleBike(bike.id)}
                              className="rounded"
                            />
                            <span className="text-foreground">{bike.name}</span>
                          </label>
                        ))}
                        {hasBikeFilter && (
                          <button
                            onClick={() => update({ bikes: "" })}
                            className="mt-1 text-xs text-foreground/40 hover:text-foreground transition-colors text-left"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  </Popover>
                </div>
              </th>

              {/* Distance */}
              <th className="px-4 py-2 font-medium text-right">
                <div className="flex items-center justify-end gap-1">
                  Distance
                  <button
                    onClick={() => toggleSort("distance_km")}
                    className={`transition-colors ${isSorted("distance_km") ? activeClass : inactiveClass}`}
                    aria-label="Sort by distance"
                    title="Sort by distance"
                  >
                    {isSorted("distance_km") && sortOrder === "asc" ? <SortAscIcon /> : <SortDescIcon />}
                  </button>
                  <Popover
                    trigger={
                      <span
                        className={`transition-colors cursor-pointer ${hasDistanceFilter ? activeClass : inactiveClass}`}
                        aria-label="Filter by distance"
                        title="Filter by distance"
                      >
                        <FilterIcon />
                      </span>
                    }
                  >
                    {(close) => (
                      <RangeFilter
                        type="number"
                        fromValue={searchParams.get("dist_from") ?? ""}
                        toValue={searchParams.get("dist_to") ?? ""}
                        fromParam="dist_from"
                        toParam="dist_to"
                        unit="km"
                        onApply={(from, to) => {
                          update({ dist_from: from, dist_to: to });
                          close();
                        }}
                      />
                    )}
                  </Popover>
                </div>
              </th>

              {/* Elevation */}
              <th className="px-4 py-2 font-medium text-right">
                <div className="flex items-center justify-end gap-1">
                  Elevation
                  <button
                    onClick={() => toggleSort("elevation_gain_m")}
                    className={`transition-colors ${isSorted("elevation_gain_m") ? activeClass : inactiveClass}`}
                    aria-label="Sort by elevation"
                    title="Sort by elevation"
                  >
                    {isSorted("elevation_gain_m") && sortOrder === "asc" ? <SortAscIcon /> : <SortDescIcon />}
                  </button>
                  <Popover
                    trigger={
                      <span
                        className={`transition-colors cursor-pointer ${hasElevationFilter ? activeClass : inactiveClass}`}
                        aria-label="Filter by elevation"
                        title="Filter by elevation"
                      >
                        <FilterIcon />
                      </span>
                    }
                  >
                    {(close) => (
                      <RangeFilter
                        type="number"
                        fromValue={searchParams.get("elev_from") ?? ""}
                        toValue={searchParams.get("elev_to") ?? ""}
                        fromParam="elev_from"
                        toParam="elev_to"
                        unit="m"
                        onApply={(from, to) => {
                          update({ elev_from: from, elev_to: to });
                          close();
                        }}
                      />
                    )}
                  </Popover>
                </div>
              </th>

              <th className="hidden sm:table-cell px-4 py-2 font-medium">Note</th>
              <th className="px-4 py-2 font-medium text-right" />
            </tr>
          </thead>
          <tbody>
            {rides.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-foreground/60">
                  No rides match your filters.
                </td>
              </tr>
            ) : (
              rides.map((ride) => (
                <tr key={ride.id} className="border-b border-foreground/5 last:border-0">
                  <td className="px-4 py-2 whitespace-nowrap">{ride.date}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{ride.bikes?.name ?? "—"}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">{ride.distance_km} km</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">{ride.elevation_gain_m} m</td>
                  <td className="hidden sm:table-cell px-4 py-2 max-w-[200px] truncate text-foreground/60">
                    {ride.personal_note || "—"}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/rides/${ride.id}/edit`}
                        className="rounded-md p-1.5 text-accent-secondary/70 hover:text-accent-secondary hover:bg-accent-secondary/5 transition-colors"
                        aria-label={`Edit ride from ${ride.date}`}
                        title="Edit"
                      >
                        <PencilIcon />
                      </Link>
                      <button
                        className="rounded-md p-1.5 text-foreground/50 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                        aria-label={`Delete ride from ${ride.date}`}
                        title="Delete"
                        onClick={() => {
                          setError(null);
                          setDeleteTarget(ride);
                        }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete ride"
        message={`Are you sure you want to delete the ride from ${deleteTarget?.date}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

function RangeFilter({
  type,
  fromValue,
  toValue,
  unit,
  onApply,
}: {
  type: "date" | "number";
  fromValue: string;
  toValue: string;
  fromParam: string;
  toParam: string;
  unit?: string;
  onApply: (from: string, to: string) => void;
}) {
  const [from, setFrom] = useState(fromValue);
  const [to, setTo] = useState(toValue);

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-0.5 text-xs text-foreground/50">
        Min{unit ? ` (${unit})` : ""}
        <input
          type={type}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded border border-foreground/10 bg-background px-2 py-1 text-sm text-foreground"
        />
      </label>
      <label className="flex flex-col gap-0.5 text-xs text-foreground/50">
        Max{unit ? ` (${unit})` : ""}
        <input
          type={type}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded border border-foreground/10 bg-background px-2 py-1 text-sm text-foreground"
        />
      </label>
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onApply(from, to)}
          className="flex-1 rounded bg-foreground/10 px-2 py-1 text-xs text-foreground hover:bg-foreground/20 transition-colors"
        >
          Apply
        </button>
        <button
          onClick={() => {
            setFrom("");
            setTo("");
            onApply("", "");
          }}
          className="rounded px-2 py-1 text-xs text-foreground/40 hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
