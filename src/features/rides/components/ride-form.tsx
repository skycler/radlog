"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Bike {
  id: string;
  name: string;
}

interface RideFormProps {
  action: (formData: FormData) => Promise<{ error: string } | void>;
  bikes: Bike[];
  defaultValues?: {
    date?: string;
    distance_km?: number;
    elevation_gain_m?: number;
    bike_id?: string;
    personal_note?: string | null;
    material_comment?: string | null;
  };
  submitLabel: string;
}

export function RideForm({ action, bikes, defaultValues = {}, submitLabel }: RideFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  if (bikes.length === 0) {
    return (
      <div className="rounded-md border border-foreground/10 px-4 py-8 text-center">
        <p className="text-foreground/60">You need to add a bike before logging a ride.</p>
        <a href="/bikes/new">
          <Button className="mt-4">Add a bike</Button>
        </a>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="date" className="block text-sm font-medium text-foreground">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={defaultValues.date ?? today}
          className="block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="bike_id" className="block text-sm font-medium text-foreground">
          Bike
        </label>
        <select
          id="bike_id"
          name="bike_id"
          required
          defaultValue={defaultValues.bike_id ?? ""}
          className="block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
        >
          <option value="" disabled>
            Select a bike
          </option>
          {bikes.map((bike) => (
            <option key={bike.id} value={bike.id}>
              {bike.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="distance_km" className="block text-sm font-medium text-foreground">
            Distance (km)
          </label>
          <input
            id="distance_km"
            name="distance_km"
            type="number"
            step="0.1"
            min="0"
            required
            defaultValue={defaultValues.distance_km ?? ""}
            className="block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
            placeholder="0.0"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="elevation_gain_m" className="block text-sm font-medium text-foreground">
            Elevation gain (m)
          </label>
          <input
            id="elevation_gain_m"
            name="elevation_gain_m"
            type="number"
            step="1"
            min="0"
            required
            defaultValue={defaultValues.elevation_gain_m ?? ""}
            className="block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="personal_note" className="block text-sm font-medium text-foreground">
          Personal note <span className="text-foreground/40">(optional)</span>
        </label>
        <textarea
          id="personal_note"
          name="personal_note"
          rows={2}
          defaultValue={defaultValues.personal_note ?? ""}
          className="block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
          placeholder="How was the ride?"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="material_comment" className="block text-sm font-medium text-foreground">
          Material comment <span className="text-foreground/40">(optional)</span>
        </label>
        <textarea
          id="material_comment"
          name="material_comment"
          rows={2}
          defaultValue={defaultValues.material_comment ?? ""}
          className="block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
          placeholder="Any notes about gear, tires, bike condition?"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={() => history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
