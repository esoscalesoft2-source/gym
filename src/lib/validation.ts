import { z } from "zod";
import { CERTIFICATIONS, LANGUAGES, SPECIALIZATIONS } from "./constants";

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
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= max), `${label} sariyilla`);

const previousGym = z.object({
  gym: z.string().trim().max(120).default(""),
  role: z.string().trim().max(80).default(""),
  from: z.string().trim().max(20).default(""),
  to: z.string().trim().max(20).default(""),
});

export const applicationSchema = z
  .object({
    // ---- Step 1: personal -------------------------------------------------
    full_name: z.string().trim().min(3, "Full name podunga (min 3 letters)").max(80),
    phone: z.string().trim().regex(PHONE_RE, "10 digit mobile number podunga"),
    email: z
      .string()
      .trim()
      .default("")
      .refine((v) => v === "" || EMAIL_RE.test(v), "Email format sariyilla"),
    gender: optionalEnum(["male", "female", "other"] as const),
    dob: optionalText(10),
    city: z.string().trim().min(2, "City podunga").max(60),
    address: optionalText(300),
    languages: z
      .array(z.enum(LANGUAGES))
      .default([])
      .refine((v) => v.length <= LANGUAGES.length, "Too many languages"),

    // ---- Step 2: professional --------------------------------------------
    experience_years: z
      .string()
      .trim()
      .min(1, "Experience podunga")
      .refine((v) => /^\d{1,2}(\.\d)?$/.test(v) && Number(v) <= 60, "0 - 60 varaikum thaan"),
    specializations: z
      .array(z.enum(SPECIALIZATIONS))
      .min(1, "Kammiyadhu oru specialization select pannunga"),
    certifications: z.array(z.enum(CERTIFICATIONS)).default([]),
    previous_gyms: z.array(previousGym).max(5).default([]),

    // ---- Step 3: job preferences -----------------------------------------
    job_type: optionalEnum(["full_time", "part_time", "freelance"] as const),
    preferred_shift: optionalEnum(["morning", "evening", "both"] as const),
    expected_salary_min: optionalInt("Salary"),
    expected_salary_max: optionalInt("Salary"),
    available_from: optionalText(10),
    willing_to_relocate: z.boolean().default(false),

    // ---- Step 4: extras ---------------------------------------------------
    bio: optionalText(300),
    instagram_url: z
      .string()
      .trim()
      .default("")
      .refine((v) => v === "" || URL_RE.test(v), "https:// la start pannanum"),
    youtube_url: z
      .string()
      .trim()
      .default("")
      .refine((v) => v === "" || URL_RE.test(v), "https:// la start pannanum"),
    reference_contact: optionalText(120),
    consent: z.literal(true, { message: "Terms accept pannunga" }),
  })
  .refine(
    (d) =>
      d.expected_salary_min === "" ||
      d.expected_salary_max === "" ||
      Number(d.expected_salary_min) <= Number(d.expected_salary_max),
    { message: "Min salary, max salary vida periyasa irukku", path: ["expected_salary_max"] },
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
  ["experience_years", "specializations", "certifications", "previous_gyms"],
  [
    "job_type",
    "preferred_shift",
    "expected_salary_min",
    "expected_salary_max",
    "available_from",
    "willing_to_relocate",
  ],
  ["bio", "instagram_url", "youtube_url", "reference_contact", "consent"],
] as const satisfies readonly (readonly (keyof ApplicationInput)[])[];
