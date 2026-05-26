"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getBikes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bikes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getBike(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bikes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createBike(formData: FormData) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { error: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Bike name is required" };

  const { error } = await supabase.from("bikes").insert({
    name,
    user_id: userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/bikes");
  redirect("/bikes");
}

export async function updateBike(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Bike name is required" };

  const { error } = await supabase
    .from("bikes")
    .update({ name })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/bikes");
  redirect("/bikes");
}

export async function getMaintenanceHistory(bikeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rides")
    .select("id, date, maintenance_note")
    .eq("bike_id", bikeId)
    .not("maintenance_note", "is", null)
    .neq("maintenance_note", "")
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteBike(id: string) {
  const supabase = await createClient();

  // Check if bike has rides
  const { count } = await supabase
    .from("rides")
    .select("*", { count: "exact", head: true })
    .eq("bike_id", id);

  if (count && count > 0) {
    return { error: `Cannot delete: this bike has ${count} ride${count > 1 ? "s" : ""} logged. Remove the rides first.` };
  }

  const { error } = await supabase.from("bikes").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/bikes");
  return { success: true };
}
