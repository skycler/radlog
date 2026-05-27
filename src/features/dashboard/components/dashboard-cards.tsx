"use client";

import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotChart } from "./plot-chart";
import type { DashboardRide } from "../actions";

interface Props {
  rides: DashboardRide[];
  year: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function DashboardCards({ rides, year }: Props) {
  const stats = useMemo(() => {
    const totalRides = rides.length;
    const totalKm = rides.reduce((s, r) => s + r.distance_km, 0);
    const totalElev = rides.reduce((s, r) => s + r.elevation_gain_m, 0);
    return { totalRides, totalKm, totalElev };
  }, [rides]);

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i,
      label: MONTHS[i],
      rides: 0,
      km: 0,
      elevation: 0,
    }));
    for (const r of rides) {
      const m = new Date(r.date).getMonth();
      months[m].rides++;
      months[m].km += r.distance_km;
      months[m].elevation += r.elevation_gain_m;
    }
    return months;
  }, [rides]);

  // Card 6: cumulative + daily data
  const timelineData = useMemo(() => {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const dayMap = new Map<string, number>();
    for (const r of rides) {
      const key = r.date;
      dayMap.set(key, (dayMap.get(key) || 0) + r.distance_km);
    }

    const days: { date: Date; dailyKm: number; cumulativeKm: number }[] = [];
    let cumulative = 0;
    const current = new Date(start);
    while (current <= end) {
      const key = current.toISOString().slice(0, 10);
      const daily = dayMap.get(key) || 0;
      cumulative += daily;
      days.push({
        date: new Date(current),
        dailyKm: daily,
        cumulativeKm: cumulative,
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [rides, year]);

  const accentColor = "var(--accent)";
  const secondaryColor = "var(--accent-secondary)";
  const mutedColor = "color-mix(in srgb, currentColor 30%, transparent)";

  if (rides.length === 0) {
    return (
      <div className="rounded-md border border-foreground/10 px-4 py-8 text-center">
        <p className="text-foreground/60">No rides recorded this year.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card 1: Stats summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Rides", value: stats.totalRides.toString() },
          { label: "Distance", value: `${Math.round(stats.totalKm).toLocaleString()} km` },
          { label: "Elevation", value: `${Math.round(stats.totalElev).toLocaleString()} m` },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-foreground/10 px-4 py-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-foreground/50">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Row 2: Boxplots + Histogram */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Card 2: Boxplots */}
        <div className="rounded-md border border-foreground/10 p-4">
          <h3 className="text-sm font-semibold text-foreground/60 mb-3">Distribution</h3>
          <PlotChart
            options={{
              height: 200,
              marginLeft: 60,
              x: { label: null },
              y: { label: null, grid: true },
              color: { range: [accentColor, secondaryColor] },
              marks: [
                Plot.boxY(rides, {
                  x: () => "Distance (km)",
                  y: "distance_km",
                  fill: accentColor,
                  fillOpacity: 0.3,
                  stroke: accentColor,
                }),
                Plot.boxY(rides, {
                  x: () => "Elevation (m)",
                  y: "elevation_gain_m",
                  fill: secondaryColor,
                  fillOpacity: 0.3,
                  stroke: secondaryColor,
                }),
              ],
            }}
          />
        </div>

        {/* Card 3: Histogram */}
        <div className="rounded-md border border-foreground/10 p-4">
          <h3 className="text-sm font-semibold text-foreground/60 mb-3">Distance distribution</h3>
          <PlotChart
            options={{
              height: 200,
              marginLeft: 40,
              x: { label: "km" },
              y: { label: "rides", grid: true },
              marks: [
                Plot.rectY(
                  rides,
                  Plot.binX(
                    { y: "count", fill: () => accentColor, fillOpacity: () => 0.6 },
                    {
                      x: "distance_km",
                      thresholds: (data: number[]) => {
                        const max = Math.max(...data);
                        const bins: number[] = [];
                        for (let i = 0; i <= max + 10; i += 10) bins.push(i);
                        return bins;
                      },
                    }
                  )
                ),
                Plot.ruleY([0]),
              ],
            }}
          />
        </div>
      </div>

      {/* Row 3: Monthly sums + Scatter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Card 4: Monthly sums */}
        <div className="rounded-md border border-foreground/10 p-4">
          <h3 className="text-sm font-semibold text-foreground/60 mb-3">Monthly distance</h3>
          <PlotChart
            options={{
              height: 200,
              marginLeft: 50,
              x: { label: null, domain: MONTHS, padding: 0.3 },
              y: { label: "km", grid: true },
              marks: [
                Plot.barY(monthlyData, {
                  x: "label",
                  y: "km",
                  fill: accentColor,
                  fillOpacity: 0.7,
                }),
                Plot.ruleY([0]),
              ],
            }}
          />
        </div>

        {/* Card 5: Scatter log-log */}
        <div className="rounded-md border border-foreground/10 p-4">
          <h3 className="text-sm font-semibold text-foreground/60 mb-3">Distance vs elevation</h3>
          <ScatterLogLog rides={rides} accentColor={accentColor} secondaryColor={secondaryColor} />
        </div>
      </div>

      {/* Card 6: Cumulative + daily */}
      <div className="rounded-md border border-foreground/10 p-4">
        <h3 className="text-sm font-semibold text-foreground/60 mb-3">Year overview</h3>
        <PlotChart
          options={{
            height: 300,
            marginLeft: 50,
            marginRight: 50,
            x: {
              label: null,
              type: "time",
            },
            y: {
              label: "cumulative km",
              grid: true,
              axis: "left",
            },
            marks: [
              // Daily bars on secondary y-axis (visual only — scaled to fit)
              Plot.barY(
                timelineData.filter((d) => d.dailyKm > 0),
                {
                  x: "date",
                  y: "dailyKm",
                  fill: secondaryColor,
                  fillOpacity: 0.4,
                  title: (d: { date: Date; dailyKm: number }) =>
                    `${d.date.toISOString().slice(0, 10)}: ${Math.round(d.dailyKm)} km`,
                }
              ),
              // Cumulative line
              Plot.lineY(timelineData, {
                x: "date",
                y: "cumulativeKm",
                stroke: accentColor,
                strokeWidth: 2,
              }),
              Plot.ruleY([0]),
            ],
          }}
        />
        <div className="flex gap-4 mt-2 text-xs text-foreground/50 justify-center">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5" style={{ backgroundColor: accentColor }} />
            Cumulative km
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: secondaryColor, opacity: 0.4 }} />
            Daily km
          </span>
        </div>
      </div>
    </div>
  );
}

// Separate component for log-log scatter with fit line
function ScatterLogLog({
  rides,
  accentColor,
  secondaryColor,
}: {
  rides: DashboardRide[];
  accentColor: string;
  secondaryColor: string;
}) {
  const { fitLine, a, b } = useMemo(() => {
    // Filter rides with positive values for log-log
    const valid = rides.filter((r) => r.distance_km > 0 && r.elevation_gain_m > 0);
    if (valid.length < 2) return { fitLine: [], a: 0, b: 0 };

    // Linear regression in log-log space: log(elev) = log(a) + b*log(dist)
    const n = valid.length;
    const logX = valid.map((r) => Math.log(r.distance_km));
    const logY = valid.map((r) => Math.log(r.elevation_gain_m));
    const sumX = logX.reduce((s, v) => s + v, 0);
    const sumY = logY.reduce((s, v) => s + v, 0);
    const sumXY = logX.reduce((s, v, i) => s + v * logY[i], 0);
    const sumX2 = logX.reduce((s, v) => s + v * v, 0);

    const bVal = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const logA = (sumY - bVal * sumX) / n;
    const aVal = Math.exp(logA);

    // Generate fit line points
    const dists = valid.map((r) => r.distance_km).sort((a, b) => a - b);
    const minD = dists[0];
    const maxD = dists[dists.length - 1];
    const steps = 50;
    const line = Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps;
      const logD = Math.log(minD) + t * (Math.log(maxD) - Math.log(minD));
      const d = Math.exp(logD);
      return { distance_km: d, elevation_gain_m: aVal * Math.pow(d, bVal) };
    });

    return { fitLine: line, a: aVal, b: bVal };
  }, [rides]);

  const validRides = rides.filter((r) => r.distance_km > 0 && r.elevation_gain_m > 0);

  if (validRides.length < 2) {
    return <p className="text-sm text-foreground/50">Need at least 2 rides with elevation data.</p>;
  }

  return (
    <>
      <PlotChart
        options={{
          height: 200,
          marginLeft: 50,
          x: { label: "km", type: "log", grid: true },
          y: { label: "m", type: "log", grid: true },
          marks: [
            Plot.dot(validRides, {
              x: "distance_km",
              y: "elevation_gain_m",
              fill: accentColor,
              fillOpacity: 0.6,
              r: 3,
            }),
            Plot.line(fitLine, {
              x: "distance_km",
              y: "elevation_gain_m",
              stroke: secondaryColor,
              strokeWidth: 1.5,
              strokeDasharray: "4,3",
            }),
          ],
        }}
      />
      <p className="text-xs text-foreground/40 mt-1 text-center">
        hm = {a.toFixed(1)} &times; km<sup>{b.toFixed(2)}</sup>
      </p>
    </>
  );
}
