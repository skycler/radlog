"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardRide {
  date: string;
  distance_km: number;
  elevation_gain_m: number;
}

export async function getDashboardRides(year: number): Promise<DashboardRide[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rides")
    .select("date, distance_km, elevation_gain_m")
    .gte("date", `${year}-01-01`)
    .lte("date", `${year}-12-31`)
    .order("date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAvailableYears(): Promise<number[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rides")
    .select("date")
    .order("date", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return [new Date().getFullYear()];

  const years = new Set(data.map((r) => new Date(r.date).getFullYear()));
  return Array.from(years).sort((a, b) => b - a);
}
