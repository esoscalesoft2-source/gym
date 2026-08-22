// Single source of truth for every dropdown / checkbox list in the app.
// Values here MUST match the CHECK constraints in supabase/schema.sql.

export const SPECIALIZATIONS = [
  "Personal Training",
  "Weight Training",
  "Strength & Conditioning",
  "CrossFit",
  "Cardio / HIIT",
  "Yoga",
  "Zumba / Aerobics",
  "Nutrition & Diet",
  "Physiotherapy / Rehab",
  "Sports Specific",
] as const;

export const CERTIFICATIONS = [
  "ACE",
  "ISSA",
  "NASM",
  "K11",
  "ACSM",
  "Diploma in Fitness",
  "B.P.Ed / M.P.Ed",
  "Other",
  "No certification",
] as const;

export const LANGUAGES = ["Tamil", "English", "Hindi", "Telugu", "Malayalam", "Kannada"] as const;

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

export const JOB_TYPES = [
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
  { value: "freelance", label: "Freelance" },
] as const;

export const SHIFTS = [
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
  { value: "both", label: "Both" },
] as const;

export const STATUSES = [
  { value: "new", label: "New", tone: "bg-slate-100 text-slate-700 ring-slate-200" },
  { value: "shortlisted", label: "Shortlisted", tone: "bg-blue-50 text-blue-700 ring-blue-200" },
  { value: "interview", label: "Interview", tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  { value: "hired", label: "Hired", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: "rejected", label: "Rejected", tone: "bg-rose-50 text-rose-700 ring-rose-200" },
] as const;

export type StatusValue = (typeof STATUSES)[number]["value"];

export function statusMeta(value: string) {
  return STATUSES.find((s) => s.value === value) ?? STATUSES[0];
}

// Upload limits — kept in sync with the storage bucket config in schema.sql
export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const PHOTO_MIME = ["image/jpeg", "image/png", "image/webp"];
export const DOC_MIME = [...PHOTO_MIME, "application/pdf"];
export const MAX_CERTIFICATES = 5;
