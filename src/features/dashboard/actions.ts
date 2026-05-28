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

export interface YearlyTarget {
  id: string;
  year: number;
  target_km: number;
  tolerance: number;
  distribution_spread: number | null;
}

export async function getYearlyTarget(year: number): Promise<YearlyTarget | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("yearly_targets")
    .select("id, year, target_km, tolerance, distribution_spread")
    .eq("year", year)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertYearlyTarget(input: {
  year: number;
  target_km: number;
  tolerance: number;
  distribution_spread: number | null;
}): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("yearly_targets")
    .upsert(
      {
        user_id: user.id,
        year: input.year,
        target_km: input.target_km,
        tolerance: input.tolerance,
        distribution_spread: input.distribution_spread,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,year" }
    );

  if (error) throw error;
}

export async function deleteYearlyTarget(year: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("yearly_targets")
    .delete()
    .eq("year", year);

  if (error) throw error;
}
