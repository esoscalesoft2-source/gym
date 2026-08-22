"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STATUSES } from "@/lib/constants";

const VALID = STATUSES.map((s) => s.value) as string[];

export async function updateApplication(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("owner_notes") ?? "");

  if (!id || !VALID.includes(status)) return;

  const supabase = await createClient();

  // RLS makes sure the row belongs to a gym this user owns.
  const { error } = await supabase
    .from("trainer_applications")
    .update({ status, owner_notes: notes.trim() || null })
    .eq("id", id);

  if (error) {
    console.error("[updateApplication]", error);
    return;
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
}
