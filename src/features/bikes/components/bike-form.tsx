"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BikeFormProps {
  action: (formData: FormData) => Promise<{ error: string } | void>;
  defaultName?: string;
  submitLabel: string;
}

export function BikeForm({ action, defaultName = "", submitLabel }: BikeFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Bike name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultName}
          className="block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
          placeholder='e.g. "Road Bike", "Gravel Bike"'
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
