"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface RideFilters {
  bike_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: "date" | "distance_km" | "elevation_gain_m";
  sort_order?: "asc" | "desc";
}

export async function getRides(filters: RideFilters = {}) {
  const supabase = await createClient();
  let query = supabase.from("rides").select("*, bikes(name)");

  if (filters.bike_id) {
    query = query.eq("bike_id", filters.bike_id);
  }
  if (filters.date_from) {
    query = query.gte("date", filters.date_from);
  }
  if (filters.date_to) {
    query = query.lte("date", filters.date_to);
  }

  const sortBy = filters.sort_by ?? "date";
  const ascending = (filters.sort_order ?? "desc") === "asc";
  query = query.order(sortBy, { ascending });

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getRide(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rides")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createRide(formData: FormData) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { error: "Not authenticated" };

  const bike_id = formData.get("bike_id") as string;
  const date = formData.get("date") as string;
  const distance_km = parseFloat(formData.get("distance_km") as string);
  const elevation_gain_m = parseFloat(formData.get("elevation_gain_m") as string);
  const personal_note = (formData.get("personal_note") as string)?.trim() || null;
  const material_comment = (formData.get("material_comment") as string)?.trim() || null;

  if (!bike_id || !date || isNaN(distance_km) || isNaN(elevation_gain_m)) {
    return { error: "All required fields must be filled" };
  }

  const { error } = await supabase.from("rides").insert({
    user_id: userId,
    bike_id,
    date,
    distance_km,
    elevation_gain_m,
    personal_note,
    material_comment,
  });

  if (error) return { error: error.message };

  revalidatePath("/rides");
  redirect("/rides");
}

export async function updateRide(id: string, formData: FormData) {
  const supabase = await createClient();

  const bike_id = formData.get("bike_id") as string;
  const date = formData.get("date") as string;
  const distance_km = parseFloat(formData.get("distance_km") as string);
  const elevation_gain_m = parseFloat(formData.get("elevation_gain_m") as string);
  const personal_note = (formData.get("personal_note") as string)?.trim() || null;
  const material_comment = (formData.get("material_comment") as string)?.trim() || null;

  if (!bike_id || !date || isNaN(distance_km) || isNaN(elevation_gain_m)) {
    return { error: "All required fields must be filled" };
  }

  const { error } = await supabase
    .from("rides")
    .update({
      bike_id,
      date,
      distance_km,
      elevation_gain_m,
      personal_note,
      material_comment,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/rides");
  redirect("/rides");
}

export async function deleteRide(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("rides").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/rides");
  return { success: true };
}
