// Single source of truth for every dropdown / checkbox list in the app.
// Firestore has no CHECK constraints, so these lists are the only source of truth —
// they are re-validated on the server in lib/validation.ts and in firestore.rules.

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

/** Slots a trainer can take, covering a normal gym day. */
export const AVAILABLE_TIMINGS = [
  "5 AM - 8 AM",
  "8 AM - 11 AM",
  "11 AM - 2 PM",
  "2 PM - 5 PM",
  "5 PM - 8 PM",
  "8 PM - 11 PM",
] as const;

// First half of the day / second half of the day — which slots the "Available
// timings" picker offers depends on the Morning/Evening shift picked above it.
export const MORNING_TIMINGS = AVAILABLE_TIMINGS.slice(0, 3);
export const EVENING_TIMINGS = AVAILABLE_TIMINGS.slice(3);

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
  { value: "new", label: "New", tone: "bg-white/5 text-foreground ring-line" },
  { value: "shortlisted", label: "Shortlisted", tone: "bg-sky-500/10 text-sky-300 ring-sky-500/30" },
  {
    value: "interview",
    label: "Interview",
    tone: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  },
  { value: "hired", label: "Hired", tone: "bg-brand/15 text-brand ring-brand/40" },
  { value: "rejected", label: "Rejected", tone: "bg-rose-500/10 text-rose-300 ring-rose-500/30" },
] as const;

export type StatusValue = (typeof STATUSES)[number]["value"];

export function statusMeta(value: string) {
  return STATUSES.find((s) => s.value === value) ?? STATUSES[0];
}

/**
 * Applications get a short per-gym running number so the owner can say
 * "application 42" on the phone instead of reading out a Firestore id.
 * Stored as an integer on `ref_no`; this is the only place it gets formatted.
 */
export function formatRef(n?: number | null) {
  return typeof n === "number" ? `#${String(n).padStart(4, "0")}` : "—";
}

// Upload limits — kept in sync with the storage bucket config in schema.sql
export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const PHOTO_MIME = ["image/jpeg", "image/png", "image/webp"];
export const DOC_MIME = [...PHOTO_MIME, "application/pdf"];
export const MAX_CERTIFICATES = 5;
