"use client";

import { useState, useTransition } from "react";
import { upsertYearlyTarget, deleteYearlyTarget } from "../actions";
import type { YearlyTarget } from "../actions";

interface Props {
  year: number;
  target: YearlyTarget | null;
}

export function TargetEditor({ year, target }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [targetKm, setTargetKm] = useState(target?.target_km?.toString() ?? "");
  const [tolerance, setTolerance] = useState(target?.tolerance?.toString() ?? "200");
  const [stdev, setStdev] = useState(target?.distribution_stdev?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setError(null);
    setSaved(false);
    const km = parseFloat(targetKm);
    const tol = parseFloat(tolerance);
    if (isNaN(km) || km <= 0) {
      setError("Target distance must be a positive number");
      return;
    }
    if (isNaN(tol) || tol < 0) {
      setError("Tolerance must be zero or positive");
      return;
    }
    const stdevVal = stdev.trim() === "" ? null : parseFloat(stdev);
    if (stdevVal !== null && (isNaN(stdevVal) || stdevVal <= 0)) {
      setError("Standard deviation must be a positive number");
      return;
    }

    startTransition(async () => {
      try {
        await upsertYearlyTarget({
          year,
          target_km: km,
          tolerance: tol,
          distribution_stdev: stdevVal,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        setError("Failed to save target");
      }
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteYearlyTarget(year);
        setTargetKm("");
        setTolerance("200");
        setStdev("");
        setIsOpen(false);
      } catch {
        setError("Failed to delete target");
      }
    });
  }

  return (
    <div className="rounded-md border border-foreground/10 px-4 py-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-sm"
      >
        <span className="font-medium">
          {target ? (
            <>
              Target:{" "}
              <span className="font-mono">
                {Math.round(target.target_km).toLocaleString()} km
              </span>
              <span className="text-foreground/50 ml-1">
                (&plusmn;{Math.round(target.tolerance).toLocaleString()}{" "}
                km)
              </span>
            </>
          ) : (
            <span className="text-foreground/50">Set a distance target for {year}</span>
          )}
        </span>
        <svg
          className={`h-4 w-4 text-foreground/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-foreground/50 mb-1">
                Target (km)
              </label>
              <input
                type="number"
                value={targetKm}
                onChange={(e) => setTargetKm(e.target.value)}
                placeholder="e.g. 8000"
                className="w-full rounded border border-foreground/20 bg-transparent px-2 py-1.5 text-sm font-mono focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-foreground/50 mb-1">
                Tolerance (km)
              </label>
              <input
                type="number"
                value={tolerance}
                onChange={(e) => setTolerance(e.target.value)}
                placeholder="e.g. 200"
                className="w-full rounded border border-foreground/20 bg-transparent px-2 py-1.5 text-sm font-mono focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-foreground/50 mb-1">
                Distribution &sigma;
                <span className="text-foreground/30 ml-1">(optional)</span>
              </label>
              <input
                type="number"
                value={stdev}
                onChange={(e) => setStdev(e.target.value)}
                placeholder="uniform"
                step="0.1"
                className="w-full rounded border border-foreground/20 bg-transparent px-2 py-1.5 text-sm font-mono focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <p className="text-xs text-foreground/30">
            Distribution &sigma; controls how riding is spread across the year.
            Leave empty for uniform. Lower values (e.g. 2) concentrate in summer,
            higher values (e.g. 5) spread more evenly.
          </p>

          {error && (
            <p className="text-xs text-accent-secondary">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Saving..." : saved ? "Saved!" : target ? "Update" : "Save"}
            </button>
            {target && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded border border-foreground/20 px-3 py-1.5 text-xs font-medium text-foreground/60 transition-colors hover:bg-foreground/5 disabled:opacity-50"
              >
                Remove target
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
