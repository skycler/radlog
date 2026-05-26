"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getRides() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rides")
    .select("*, bikes(name)")
    .order("date", { ascending: false });

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
