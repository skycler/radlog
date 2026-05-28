"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { upsertYearlyTarget, deleteYearlyTarget } from "../actions";
import type { YearlyTarget } from "../actions";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CENTER = 5.5;
const SIGMA_MIN = 0.7;
const K = 3;

function computeMonthlyWeights(spread: number): number[] {
  const sigma = SIGMA_MIN * Math.exp(K * spread);
  const raw = Array.from({ length: 12 }, (_, m) =>
    Math.exp(-0.5 * ((m - CENTER) / sigma) ** 2)
  );
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((w) => w / sum);
}

interface Props {
  year: number;
  target: YearlyTarget | null;
}

export function TargetEditor({ year, target }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [targetKm, setTargetKm] = useState(target?.target_km?.toString() ?? "");
  const [toleranceValue, setToleranceValue] = useState(
    target?.tolerance?.toString() ?? "200"
  );
  const [toleranceMode, setToleranceMode] = useState<"km" | "%">("km");
  const [spread, setSpread] = useState(target?.distribution_spread ?? 0.5);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const weights = useMemo(() => computeMonthlyWeights(spread), [spread]);

  const targetKmNum = parseFloat(targetKm);
  const monthlyKm = useMemo(() => {
    if (isNaN(targetKmNum) || targetKmNum <= 0) return null;
    return weights.map((w) => Math.round(w * targetKmNum));
  }, [weights, targetKmNum]);

  const maxMonthly = monthlyKm ? Math.max(...monthlyKm) : 0;

  const toleranceKm = useMemo(() => {
    const val = parseFloat(toleranceValue);
    if (isNaN(val) || val < 0) return 0;
    if (toleranceMode === "%") {
      return isNaN(targetKmNum) ? 0 : Math.round((val / 100) * targetKmNum);
    }
    return val;
  }, [toleranceValue, toleranceMode, targetKmNum]);

  function handleSave() {
    setError(null);
    setSaved(false);
    if (isNaN(targetKmNum) || targetKmNum <= 0) {
      setError("Target distance must be a positive number");
      return;
    }
    const tolVal = parseFloat(toleranceValue);
    if (isNaN(tolVal) || tolVal < 0) {
      setError("Tolerance must be zero or positive");
      return;
    }

    startTransition(async () => {
      try {
        await upsertYearlyTarget({
          year,
          target_km: targetKmNum,
          tolerance: toleranceKm,
          distribution_spread: spread,
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
        setToleranceValue("200");
        setToleranceMode("km");
        setSpread(0.5);
        setIsOpen(false);
      } catch {
        setError("Failed to delete target");
      }
    });
  }

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setError(null);
    setSaved(false);
  }, []);

  return (
    <>
      {/* Icon button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Set yearly target"
        className="p-1.5 rounded-md transition-colors hover:bg-foreground/5"
      >
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 ${target ? "text-accent" : "text-foreground/30"}`}
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal content */}
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-lg border border-foreground/10 bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {year} Distance Target
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 text-foreground/40 hover:text-foreground"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {/* Target + Tolerance row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
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
                  Tolerance
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={toleranceValue}
                    onChange={(e) => setToleranceValue(e.target.value)}
                    placeholder={toleranceMode === "km" ? "e.g. 200" : "e.g. 5"}
                    className="w-full rounded-l border border-r-0 border-foreground/20 bg-transparent px-2 py-1.5 text-sm font-mono focus:border-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (toleranceMode === "km") {
                        // Convert km to %
                        const km = parseFloat(toleranceValue);
                        if (!isNaN(km) && !isNaN(targetKmNum) && targetKmNum > 0) {
                          setToleranceValue(((km / targetKmNum) * 100).toFixed(1));
                        }
                        setToleranceMode("%");
                      } else {
                        // Convert % to km
                        const pct = parseFloat(toleranceValue);
                        if (!isNaN(pct) && !isNaN(targetKmNum) && targetKmNum > 0) {
                          setToleranceValue(Math.round((pct / 100) * targetKmNum).toString());
                        }
                        setToleranceMode("km");
                      }
                    }}
                    className="rounded-r border border-foreground/20 bg-foreground/5 px-2 py-1.5 text-xs font-medium text-foreground/60 hover:bg-foreground/10 transition-colors whitespace-nowrap"
                  >
                    {toleranceMode}
                  </button>
                </div>
                {toleranceMode === "%" && !isNaN(toleranceKm) && toleranceKm > 0 && (
                  <p className="text-xs text-foreground/30 mt-0.5 font-mono">
                    = &plusmn;{toleranceKm.toLocaleString()} km
                  </p>
                )}
              </div>
            </div>

            {/* Seasonality slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-foreground/50">Seasonality</label>
                <span className="text-xs text-foreground/30">
                  {spread === 0 ? "summer only" : spread >= 0.95 ? "year-round" : `${(spread * 100).toFixed(0)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={spread}
                onChange={(e) => setSpread(parseFloat(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-[10px] text-foreground/20 mt-0.5">
                <span>summer only</span>
                <span>year-round</span>
              </div>
            </div>

            {/* Monthly distribution bar chart */}
            <div className="mb-4">
              <p className="text-xs text-foreground/50 mb-2">Monthly distribution</p>
              <div className="flex items-end gap-1 h-24">
                {weights.map((w, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    {monthlyKm && (
                      <span className="text-[9px] font-mono text-foreground/40">
                        {monthlyKm[i]}
                      </span>
                    )}
                    <div
                      className="w-full rounded-t bg-accent/70 transition-all duration-150"
                      style={{
                        height: `${maxMonthly > 0 ? (monthlyKm![i] / maxMonthly) * 72 : w * 12 * 72}px`,
                        minHeight: "2px",
                      }}
                    />
                    <span className="text-[9px] text-foreground/30">{MONTHS[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-accent-secondary mb-3">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="rounded bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "Saving..." : saved ? "Saved!" : target ? "Update" : "Save"}
              </button>
              {target && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="rounded border border-foreground/20 px-4 py-1.5 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/5 disabled:opacity-50"
                >
                  Remove target
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="ml-auto rounded border border-foreground/20 px-4 py-1.5 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
