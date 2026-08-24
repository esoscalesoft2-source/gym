import { z } from "zod";
import { AVAILABLE_TIMINGS, CERTIFICATIONS, LANGUAGES, SPECIALIZATIONS } from "./constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/; // Indian mobile
const URL_RE = /^https?:\/\/\S+$/;

/** Optional free text: empty string is allowed, otherwise max length applies. */
const optionalText = (max: number) => z.string().trim().max(max).default("");

/** Optional value that must be one of `values` when it is not empty. */
const optionalEnum = <T extends string>(values: readonly T[]) =>
  z
    .string()
    .default("")
    .refine((v) => v === "" || (values as readonly string[]).includes(v), "Invalid option");

/** Optional whole number entered in a text/number input. */
const optionalInt = (label: string, max = 10_000_000) =>
  z
    .string()
    .trim()
    .default("")
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= max), `${label} is not valid`);

const previousGym = z.object({
  gym: z.string().trim().max(120).default(""),
  role: z.string().trim().max(80).default(""),
  from: z.string().trim().max(20).default(""),
  to: z.string().trim().max(20).default(""),
});

export const applicationSchema = z
  .object({
    // ---- Step 1: personal -------------------------------------------------
    full_name: z.string().trim().min(3, "Enter your full name (min 3 letters)").max(80),
    phone: z.string().trim().regex(PHONE_RE, "Enter a 10 digit mobile number"),
    email: z
      .string()
      .trim()
      .default("")
      .refine((v) => v === "" || EMAIL_RE.test(v), "That email address is not valid"),
    gender: optionalEnum(["male", "female", "other"] as const),
    dob: optionalText(10),
    city: z.string().trim().min(2, "Enter your city").max(60),
    address: optionalText(300),
    languages: z
      .array(z.enum(LANGUAGES))
      .default([])
      .refine((v) => v.length <= LANGUAGES.length, "Too many languages"),

    // ---- Step 2: professional --------------------------------------------
    experience_years: z
      .string()
      .trim()
      .min(1, "Enter your years of experience")
      .refine((v) => /^\d{1,2}(\.\d)?$/.test(v) && Number(v) <= 60, "Must be between 0 and 60"),
    specializations: z
      .array(z.enum(SPECIALIZATIONS))
      .min(1, "Select at least one specialization"),
    certifications: z.array(z.enum(CERTIFICATIONS)).default([]),
    // Free text shown only when "Other" is checked above; required in that case
    // (enforced below, since a top-level .refine() is skipped while any other
    // field — namely `consent` — is still invalid).
    certification_other: optionalText(60),
    previous_gyms: z.array(previousGym).max(5).default([]),

    // ---- Step 3: job preferences -----------------------------------------
    job_type: optionalEnum(["full_time", "part_time", "freelance"] as const),
    preferred_shift: optionalEnum(["morning", "evening", "both"] as const),
    expected_salary_min: optionalInt("Salary"),
    expected_salary_max: optionalInt("Salary"),
    available_from: optionalText(10),
    available_timings: z.array(z.enum(AVAILABLE_TIMINGS)).default([]),
    willing_to_relocate: z.boolean().default(false),

    // ---- Step 4: extras ---------------------------------------------------
    bio: optionalText(300),
    instagram_url: z
      .string()
      .trim()
      .default("")
      .refine((v) => v === "" || URL_RE.test(v), "Must start with https://"),
    youtube_url: z
      .string()
      .trim()
      .default("")
      .refine((v) => v === "" || URL_RE.test(v), "Must start with https://"),
    reference_contact: optionalText(120),
    consent: z.literal(true, { message: "Please accept the terms" }),
  })
  .refine(
    (d) =>
      d.expected_salary_min === "" ||
      d.expected_salary_max === "" ||
      Number(d.expected_salary_min) <= Number(d.expected_salary_max),
    { message: "Minimum salary is higher than the maximum", path: ["expected_salary_max"] },
  )
  .refine((d) => !d.certifications.includes("Other") || d.certification_other.trim() !== "", {
    message: "Enter your certification",
    path: ["certification_other"],
  })
  .refine(
    (d) =>
      Number(d.experience_years) < 1 || d.previous_gyms.some((g) => g.gym.trim() !== ""),
    {
      message: "Add at least one gym you have worked at",
      path: ["previous_gyms"],
    },
  );

export type ApplicationInput = z.input<typeof applicationSchema>;
export type ApplicationValues = z.output<typeof applicationSchema>;

/** Storage paths produced by the client-side uploader, validated server-side too. */
export const uploadPathsSchema = z.object({
  photo_path: z.string().trim().max(300).default(""),
  resume_path: z.string().trim().max(300).default(""),
  certificate_paths: z.array(z.string().trim().max(300)).max(5).default([]),
});

export type UploadPaths = z.infer<typeof uploadPathsSchema>;

/** Fields validated when the user presses "Next" on each step. */
export const STEP_FIELDS = [
  ["full_name", "phone", "email", "gender", "dob", "city", "address", "languages"],
  ["experience_years", "specializations", "certifications", "certification_other", "previous_gyms"],
  [
    "job_type",
    "preferred_shift",
    "expected_salary_min",
    "expected_salary_max",
    "available_from",
    "available_timings",
    "willing_to_relocate",
  ],
  ["bio", "instagram_url", "youtube_url", "reference_contact", "consent"],
] as const satisfies readonly (readonly (keyof ApplicationInput)[])[];
