"use client";

import { useMemo, useCallback } from "react";
import { PlotChart } from "./plot-chart";
import { ChartCard } from "./chart-card";
import type { DashboardRide } from "../actions";

function computeBoxStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return null;
  const q1 = sorted[Math.floor(n * 0.25)];
  const median = sorted[Math.floor(n * 0.5)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const lower = Math.max(sorted[0], q1 - 1.5 * iqr);
  const upper = Math.min(sorted[n - 1], q3 + 1.5 * iqr);
  const outliers = sorted.filter((v) => v < lower || v > upper);
  return { q1, median, q3, iqr, lower, upper, min: sorted[0], max: sorted[n - 1], outliers };
}

interface Props {
  rides: DashboardRide[];
  year: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ACCENT = "var(--accent)";
const SECONDARY = "var(--accent-secondary)";

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

  const timelineData = useMemo(() => {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const dayMap = new Map<string, number>();
    for (const r of rides) {
      dayMap.set(r.date, (dayMap.get(r.date) || 0) + r.distance_km);
    }
    const days: { date: Date; dailyKm: number; cumulativeKm: number }[] = [];
    let cumulative = 0;
    const current = new Date(start);
    while (current <= end) {
      const key = current.toISOString().slice(0, 10);
      const daily = dayMap.get(key) || 0;
      cumulative += daily;
      days.push({ date: new Date(current), dailyKm: daily, cumulativeKm: cumulative });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [rides, year]);

  const kmStats = useMemo(() => computeBoxStats(rides.map((r) => r.distance_km)), [rides]);
  const elevStats = useMemo(() => computeBoxStats(rides.map((r) => r.elevation_gain_m)), [rides]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildBoxplotKm = useCallback((Plot: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const marks: any[] = [
      Plot.boxY(rides, {
        x: () => "km",
        y: "distance_km",
        fill: ACCENT,
        fillOpacity: 0.3,
        stroke: ACCENT,
      }),
    ];
    if (kmStats) {
      const statPoints = [
        { x: "km", y: kmStats.lower, label: `Whisker: ${Math.round(kmStats.lower)} km` },
        { x: "km", y: kmStats.q1, label: `Q1: ${Math.round(kmStats.q1)} km` },
        { x: "km", y: kmStats.median, label: `Median: ${Math.round(kmStats.median)} km` },
        { x: "km", y: kmStats.q3, label: `Q3: ${Math.round(kmStats.q3)} km` },
        { x: "km", y: kmStats.upper, label: `Whisker: ${Math.round(kmStats.upper)} km` },
        ...kmStats.outliers.map((v) => ({ x: "km", y: v, label: `Outlier: ${Math.round(v)} km` })),
      ];
      marks.push(Plot.tip(statPoints, Plot.pointer({ x: "x", y: "y", title: "label" })));
    }
    return {
      height: 200,
      marginLeft: 40,
      marginRight: 10,
      x: { label: null, domain: ["km"], padding: 0.4 },
      y: { label: "km", grid: true },
      marks,
    };
  }, [rides, kmStats]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildBoxplotElev = useCallback((Plot: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const marks: any[] = [
      Plot.boxY(rides, {
        x: () => "m",
        y: "elevation_gain_m",
        fill: SECONDARY,
        fillOpacity: 0.3,
        stroke: SECONDARY,
      }),
    ];
    if (elevStats) {
      const statPoints = [
        { x: "m", y: elevStats.lower, label: `Whisker: ${Math.round(elevStats.lower)} m` },
        { x: "m", y: elevStats.q1, label: `Q1: ${Math.round(elevStats.q1)} m` },
        { x: "m", y: elevStats.median, label: `Median: ${Math.round(elevStats.median)} m` },
        { x: "m", y: elevStats.q3, label: `Q3: ${Math.round(elevStats.q3)} m` },
        { x: "m", y: elevStats.upper, label: `Whisker: ${Math.round(elevStats.upper)} m` },
        ...elevStats.outliers.map((v) => ({ x: "m", y: v, label: `Outlier: ${Math.round(v)} m` })),
      ];
      marks.push(Plot.tip(statPoints, Plot.pointer({ x: "x", y: "y", title: "label" })));
    }
    return {
      height: 200,
      marginLeft: 40,
      marginRight: 10,
      x: { label: null, domain: ["m"], padding: 0.4 },
      y: { label: "m", grid: true },
      marks,
    };
  }, [rides, elevStats]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildHistogram = useCallback((Plot: any) => ({
    height: 200,
    marginLeft: 40,
    x: { label: "km" },
    y: { label: "rides", grid: true },
    marks: [
      Plot.rectY(
        rides,
        Plot.binX(
          { y: "count", fill: () => ACCENT, fillOpacity: () => 0.6 },
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
  }), [rides]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildMonthly = useCallback((Plot: any) => ({
    height: 200,
    marginLeft: 50,
    x: { label: null, domain: MONTHS, padding: 0.3 },
    y: { label: "km", grid: true },
    marks: [
      Plot.barY(monthlyData, {
        x: "label",
        y: "km",
        fill: ACCENT,
        fillOpacity: 0.7,
      }),
      Plot.tip(monthlyData, Plot.pointerX({
        x: "label",
        y: "km",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (d: any) => `${d.label}: ${Math.round(d.km)} km\n${d.rides} ride${d.rides !== 1 ? "s" : ""}\n${Math.round(d.elevation).toLocaleString()} m elev`,
      })),
      Plot.ruleY([0]),
    ],
  }), [monthlyData]);

  const dailyBars = useMemo(() => timelineData.filter((d) => d.dailyKm > 0), [timelineData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildTimeline = useCallback((Plot: any) => ({
    height: 300,
    marginLeft: 50,
    marginRight: 50,
    x: { label: null, type: "time" },
    y: { label: "cumulative km", grid: true, axis: "left" },
    marks: [
      Plot.barY(dailyBars, {
        x: "date",
        y: "dailyKm",
        fill: SECONDARY,
        fillOpacity: 0.4,
      }),
      Plot.lineY(timelineData, {
        x: "date",
        y: "cumulativeKm",
        stroke: ACCENT,
        strokeWidth: 2,
      }),
      Plot.tip(timelineData, Plot.pointerX({
        x: "date",
        y: "cumulativeKm",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (d: any) => `${d.date.toISOString().slice(0, 10)}\n${Math.round(d.cumulativeKm).toLocaleString()} km total${d.dailyKm > 0 ? `\n${Math.round(d.dailyKm)} km today` : ""}`,
      })),
      Plot.ruleY([0]),
    ],
  }), [dailyBars, timelineData]);

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

      {/* Row 2: Monthly + Histogram */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ChartCard title="Monthly distance">
          <PlotChart buildOptions={buildMonthly} />
        </ChartCard>
        <ChartCard title="Distance distribution">
          <PlotChart buildOptions={buildHistogram} />
        </ChartCard>
      </div>

      {/* Row 3: Scatter + Boxplots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ChartCard title="Distance vs elevation">
          <ScatterLogLog rides={rides} />
        </ChartCard>
        <ChartCard title="Distribution" className="grid grid-cols-2 gap-2">
          <PlotChart buildOptions={buildBoxplotKm} />
          <PlotChart buildOptions={buildBoxplotElev} />
        </ChartCard>
      </div>

      {/* Card 6: Cumulative + daily */}
      <ChartCard title="Year overview">
        <PlotChart buildOptions={buildTimeline} />
        <div className="flex gap-4 mt-2 text-xs text-foreground/50 justify-center">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5" style={{ backgroundColor: ACCENT }} />
            Cumulative km
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: SECONDARY, opacity: 0.4 }} />
            Daily km
          </span>
        </div>
      </ChartCard>
    </div>
  );
}

function ScatterLogLog({ rides }: { rides: DashboardRide[] }) {
  const { fitLine, a, b } = useMemo(() => {
    const valid = rides.filter((r) => r.distance_km > 0 && r.elevation_gain_m > 0);
    if (valid.length < 2) return { fitLine: [], a: 0, b: 0 };

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

    const dists = valid.map((r) => r.distance_km).sort((x, y) => x - y);
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

  const validRides = useMemo(
    () => rides.filter((r) => r.distance_km > 0 && r.elevation_gain_m > 0),
    [rides]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildScatter = useCallback((Plot: any) => ({
    height: 200,
    marginLeft: 50,
    x: { label: "km", type: "log", grid: true },
    y: { label: "m", type: "log", grid: true },
    marks: [
      Plot.dot(validRides, {
        x: "distance_km",
        y: "elevation_gain_m",
        fill: ACCENT,
        fillOpacity: 0.6,
        r: 3,
      }),
      Plot.tip(validRides, Plot.pointer({
        x: "distance_km",
        y: "elevation_gain_m",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (d: any) => `${d.distance_km.toFixed(1)} km\n${Math.round(d.elevation_gain_m)} m elev`,
      })),
      Plot.line(fitLine, {
        x: "distance_km",
        y: "elevation_gain_m",
        stroke: SECONDARY,
        strokeWidth: 1.5,
        strokeDasharray: "4,3",
      }),
    ],
  }), [validRides, fitLine]);

  if (validRides.length < 2) {
    return <p className="text-sm text-foreground/50">Need at least 2 rides with elevation data.</p>;
  }

  return (
    <>
      <PlotChart buildOptions={buildScatter} />
      <p className="text-xs text-foreground/40 mt-1 text-center">
        hm = {a.toFixed(1)} &times; km<sup>{b.toFixed(2)}</sup>
      </p>
    </>
  );
}
