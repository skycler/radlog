"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PencilIcon, TrashIcon, WrenchIcon } from "@/components/ui/icons";
import { deleteBike } from "../actions";

interface Bike {
  id: string;
  name: string;
  created_at: string;
}

export function BikeList({ bikes }: { bikes: Bike[] }) {
  const [deleteTarget, setDeleteTarget] = useState<Bike | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteBike(deleteTarget.id);
    if (result?.error) {
      setError(result.error);
    }
    setDeleteTarget(null);
  }

  if (bikes.length === 0) {
    return (
      <div className="rounded-md border border-foreground/10 px-4 py-8 text-center">
        <p className="text-foreground/60">No bikes yet.</p>
        <Link href="/bikes/new">
          <Button className="mt-4">Add your first bike</Button>
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
      <ul className="divide-y divide-foreground/10 rounded-md border border-foreground/10">
        {bikes.map((bike) => (
          <li key={bike.id} className="flex items-center justify-between px-4 py-3">
            <span className="font-medium text-foreground">{bike.name}</span>
            <div className="flex gap-1">
              <Link
                href={`/bikes/${bike.id}/maintenance`}
                className="rounded-md p-1.5 text-accent-secondary/70 hover:text-accent-secondary hover:bg-accent-secondary/5 transition-colors"
                aria-label={`Maintenance history for ${bike.name}`}
                title="Maintenance"
              >
                <WrenchIcon />
              </Link>
              <Link
                href={`/bikes/${bike.id}/edit`}
                className="rounded-md p-1.5 text-accent-secondary/70 hover:text-accent-secondary hover:bg-accent-secondary/5 transition-colors"
                aria-label={`Edit ${bike.name}`}
                title="Edit"
              >
                <PencilIcon />
              </Link>
              <button
                className="rounded-md p-1.5 text-foreground/50 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                aria-label={`Delete ${bike.name}`}
                title="Delete"
                onClick={() => {
                  setError(null);
                  setDeleteTarget(bike);
                }}
              >
                <TrashIcon />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete bike"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
