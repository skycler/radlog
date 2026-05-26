"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Bike {
  id: string;
  name: string;
}

export function RideFilters({ bikes }: { bikes: Bike[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bikeId = searchParams.get("bike") ?? "";
  const dateFrom = searchParams.get("from") ?? "";
  const dateTo = searchParams.get("to") ?? "";
  const sortBy = searchParams.get("sort") ?? "date";
  const sortOrder = searchParams.get("order") ?? "desc";

  const hasFilters = bikeId || dateFrom || dateTo || sortBy !== "date" || sortOrder !== "desc";

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
      // Remove defaults to keep URL clean
      if (params.get("sort") === "date") params.delete("sort");
      if (params.get("order") === "desc") params.delete("order");
      const qs = params.toString();
      router.push(qs ? `/rides?${qs}` : "/rides");
    },
    [router, searchParams],
  );

  function clearFilters() {
    router.push("/rides");
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-foreground/50">
        Bike
        <select
          value={bikeId}
          onChange={(e) => update({ bike: e.target.value })}
          className="rounded-md border border-foreground/10 bg-background px-2 py-1.5 text-sm text-foreground"
        >
          <option value="">All bikes</option>
          {bikes.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-foreground/50">
        From
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => update({ from: e.target.value })}
          className="rounded-md border border-foreground/10 bg-background px-2 py-1.5 text-sm text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-foreground/50">
        To
        <input
          type="date"
          value={dateTo}
          onChange={(e) => update({ to: e.target.value })}
          className="rounded-md border border-foreground/10 bg-background px-2 py-1.5 text-sm text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-foreground/50">
        Sort by
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split("-");
            update({ sort: s, order: o });
          }}
          className="rounded-md border border-foreground/10 bg-background px-2 py-1.5 text-sm text-foreground"
        >
          <option value="date-desc">Date (newest)</option>
          <option value="date-asc">Date (oldest)</option>
          <option value="distance_km-desc">Distance (highest)</option>
          <option value="distance_km-asc">Distance (lowest)</option>
          <option value="elevation_gain_m-desc">Elevation (highest)</option>
          <option value="elevation_gain_m-asc">Elevation (lowest)</option>
        </select>
      </label>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="rounded-md px-2 py-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
