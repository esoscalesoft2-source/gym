"use server";

import { createClient } from "@/lib/supabase/server";
import { applicationSchema, uploadPathsSchema } from "@/lib/validation";

export type SubmitResult = { ok: true } | { ok: false; message: string };

const emptyToNull = (v: string) => (v.trim() === "" ? null : v.trim());
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

export async function submitApplication(raw: unknown, rawPaths: unknown): Promise<SubmitResult> {
  const gymId = process.env.NEXT_PUBLIC_GYM_ID;
  if (!gymId) {
    return { ok: false, message: "Site setup incomplete — NEXT_PUBLIC_GYM_ID missing." };
  }

  // Never trust the client: re-run the exact same schema on the server.
  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Form-la ethuvo thappa irukku. Thirumba check pannunga." };
  }
  const paths = uploadPathsSchema.safeParse(rawPaths);
  if (!paths.success) {
    return { ok: false, message: "File upload fail aayiduchu. Thirumba try pannunga." };
  }

  const d = parsed.data;
  const supabase = await createClient();

  // Attach the currently open job post, if the gym has one.
  const { data: post } = await supabase
    .from("job_posts")
    .select("id")
    .eq("gym_id", gymId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("trainer_applications").insert({
    gym_id: gymId,
    job_post_id: post?.id ?? null,

    full_name: d.full_name,
    gender: emptyToNull(d.gender),
    dob: emptyToNull(d.dob),
    phone: d.phone,
    email: emptyToNull(d.email),
    city: d.city,
    address: emptyToNull(d.address),
    languages: d.languages,
    photo_path: emptyToNull(paths.data.photo_path),

    experience_years: Number(d.experience_years),
    specializations: d.specializations,
    certifications: d.certifications,
    certificate_paths: paths.data.certificate_paths,
    resume_path: emptyToNull(paths.data.resume_path),
    previous_gyms: d.previous_gyms.filter((g) => g.gym.trim() !== ""),

    job_type: emptyToNull(d.job_type),
    preferred_shift: emptyToNull(d.preferred_shift),
    expected_salary_min: numOrNull(d.expected_salary_min),
    expected_salary_max: numOrNull(d.expected_salary_max),
    available_from: emptyToNull(d.available_from),
    willing_to_relocate: d.willing_to_relocate,

    bio: emptyToNull(d.bio),
    instagram_url: emptyToNull(d.instagram_url),
    youtube_url: emptyToNull(d.youtube_url),
    reference_contact: emptyToNull(d.reference_contact),

    status: "new",
  });

  if (error) {
    // 23505 = the (gym_id, phone) unique index — same number already applied.
    if (error.code === "23505") {
      return {
        ok: false,
        message: "Indha number vechu already apply pannirukeenga. Naanga call pannuvom!",
      };
    }
    console.error("[submitApplication]", error);
    return { ok: false, message: "Save panna mudiyala. Konja neram kazhichu try pannunga." };
  }

  return { ok: true };
}
