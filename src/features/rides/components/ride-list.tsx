"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";
import { deleteRide } from "../actions";

interface Ride {
  id: string;
  date: string;
  distance_km: number;
  elevation_gain_m: number;
  personal_note: string | null;
  bikes: { name: string } | null;
}

export function RideList({ rides, filtered }: { rides: Ride[]; filtered?: boolean }) {
  const [deleteTarget, setDeleteTarget] = useState<Ride | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteRide(deleteTarget.id);
    if (result?.error) {
      setError(result.error);
    }
    setDeleteTarget(null);
  }

  if (rides.length === 0) {
    if (filtered) {
      return (
        <div className="rounded-md border border-foreground/10 px-4 py-8 text-center">
          <p className="text-foreground/60">No rides match your filters.</p>
        </div>
      );
    }
    return (
      <div className="rounded-md border border-foreground/10 px-4 py-8 text-center">
        <p className="text-foreground/60">No rides yet.</p>
        <Link href="/rides/new">
          <Button className="mt-4">Log your first ride</Button>
        </Link>
      </div>
    );
  }

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
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Bike</th>
              <th className="px-4 py-2 font-medium text-right">Distance</th>
              <th className="px-4 py-2 font-medium text-right">Elevation</th>
              <th className="hidden sm:table-cell px-4 py-2 font-medium">Note</th>
              <th className="px-4 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rides.map((ride) => (
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
                      className="rounded-md p-1.5 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors"
                      aria-label={`Edit ride from ${ride.date}`}
                    >
                      <PencilIcon />
                    </Link>
                    <button
                      className="rounded-md p-1.5 text-foreground/50 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                      aria-label={`Delete ride from ${ride.date}`}
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
            ))}
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
