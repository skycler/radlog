"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ImportRide {
  date: string;
  distance_km: number;
  elevation_gain_m: number;
  bike_id: string;
  personal_note?: string | null;
  maintenance_note?: string | null;
}

export interface ImportResult {
  inserted: number;
  bikesCreated: number;
  error?: string;
}

export async function createBikesForImport(
  names: string[],
): Promise<{ bikes: { id: string; name: string }[]; error?: string }> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { bikes: [], error: "Not authenticated" };

  if (names.length === 0) return { bikes: [] };

  const rows = names.map((name) => ({ name, user_id: userId }));
  const { data, error } = await supabase
    .from("bikes")
    .insert(rows)
    .select("id, name");

  if (error) return { bikes: [], error: error.message };
  return { bikes: data ?? [] };
}

export async function importRides(
  rides: ImportRide[],
): Promise<ImportResult> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { inserted: 0, bikesCreated: 0, error: "Not authenticated" };

  if (rides.length === 0) return { inserted: 0, bikesCreated: 0, error: "No rides to import" };
  if (rides.length > 1000) return { inserted: 0, bikesCreated: 0, error: "Maximum 1000 rides per import" };

  const rows = rides.map((r) => ({
    user_id: userId,
    bike_id: r.bike_id,
    date: r.date,
    distance_km: r.distance_km,
    elevation_gain_m: r.elevation_gain_m,
    personal_note: r.personal_note?.trim() || null,
    maintenance_note: r.maintenance_note?.trim() || null,
  }));

  const { error } = await supabase.from("rides").insert(rows);

  if (error) return { inserted: 0, bikesCreated: 0, error: error.message };

  revalidatePath("/rides");
  return { inserted: rows.length, bikesCreated: 0 };
}
