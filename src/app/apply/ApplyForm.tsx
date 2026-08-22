"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { submitApplication } from "./actions";

import {
  CERTIFICATIONS,
  GENDERS,
  JOB_TYPES,
  LANGUAGES,
  MAX_CERTIFICATES,
  SHIFTS,
  SPECIALIZATIONS,
} from "@/lib/constants";
import {
  STEP_FIELDS,
  applicationSchema,
  type ApplicationInput,
  type ApplicationValues,
} from "@/lib/validation";
import { createClient } from "@/lib/supabase/client";
import { checkFile, uploadFile } from "@/lib/upload";
import { ChipGroup, Field, FileInput, RadioRow, inputClass } from "@/components/form-fields";

const STEPS = ["Unga vivaram", "Experience", "Job preference", "Kadaisi step"];

const defaults: DefaultValues<ApplicationInput> = {
  full_name: "",
  phone: "",
  email: "",
  gender: "",
  dob: "",
  city: "",
  address: "",
  languages: [],
  experience_years: "",
  specializations: [],
  certifications: [],
  previous_gyms: [],
  job_type: "",
  preferred_shift: "",
  expected_salary_min: "",
  expected_salary_max: "",
  available_from: "",
  willing_to_relocate: false,
  bio: "",
  instagram_url: "",
  youtube_url: "",
  reference_contact: "",
  consent: undefined, // user must tick it themselves
};

export default function ApplyForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [photo, setPhoto] = useState<File[]>([]);
  const [resume, setResume] = useState<File[]>([]);
  const [certs, setCerts] = useState<File[]>([]);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ApplicationInput, unknown, ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });

  const gyms = useFieldArray({ control, name: "previous_gyms" });

  /**
   * Cross-field rules live in a top-level zod `.refine()`, which zod skips while any
   * field is still invalid (`consent` is empty until the last step). So they never fire
   * on a per-step `trigger()` — check them here too, otherwise the user only finds out
   * at submit time.
   */
  const checkStepExtras = () => {
    if (step !== 2) return true;
    const { expected_salary_min: min, expected_salary_max: max } = getValues();
    if (min && max && Number(min) > Number(max)) {
      setError("expected_salary_max", {
        message: "Min salary, max salary vida periyasa irukku",
      });
      return false;
    }
    clearErrors("expected_salary_max");
    return true;
  };

  const next = async () => {
    const ok = await trigger(STEP_FIELDS[step] as never);
    if (ok && checkStepExtras()) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pickFiles = (
    kind: "photo" | "doc",
    setter: (f: File[]) => void,
    max: number,
  ) => (files: File[]) => {
    const slice = files.slice(0, max);
    for (const f of slice) {
      const err = checkFile(f, kind);
      if (err) {
        setFileError(`${f.name}: ${err}`);
        return;
      }
    }
    setFileError(null);
    setter(slice);
  };

  const onSubmit = async (values: ApplicationValues) => {
    setServerError(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const [photo_path, resume_path, certificate_paths] = await Promise.all([
        photo[0] ? uploadFile(supabase, photo[0], "photos") : Promise.resolve(""),
        resume[0] ? uploadFile(supabase, resume[0], "resumes") : Promise.resolve(""),
        Promise.all(certs.map((f) => uploadFile(supabase, f, "certificates"))),
      ]);

      const res = await submitApplication(values, {
        photo_path,
        resume_path,
        certificate_paths,
      });

      if (res.ok) router.push("/apply/success");
      else setServerError(res.message);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Ethuvo thappa poyiduchu.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="pb-24">
      {/* progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>
            Step {step + 1} / {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ---------------- STEP 1 : personal ---------------- */}
      {step === 0 && (
        <div className="space-y-5">
          <Field label="Full name" required error={errors.full_name?.message}>
            <input {...register("full_name")} className={inputClass} placeholder="Ramesh Kumar" />
          </Field>

          <Field
            label="Mobile number"
            required
            hint="Idhukku thaan naanga call / WhatsApp pannuvom"
            error={errors.phone?.message}
          >
            <input
              {...register("phone")}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className={inputClass}
              placeholder="9876543210"
            />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              className={inputClass}
              placeholder="name@email.com"
            />
          </Field>

          <Field label="Gender" error={errors.gender?.message}>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <RadioRow
                  name="gender"
                  options={GENDERS}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>

          <Field label="Date of birth" error={errors.dob?.message}>
            <input {...register("dob")} type="date" className={inputClass} />
          </Field>

          <Field label="City / Area" required error={errors.city?.message}>
            <input {...register("city")} className={inputClass} placeholder="Coimbatore" />
          </Field>

          <Field label="Address" error={errors.address?.message}>
            <textarea {...register("address")} rows={3} className={inputClass} />
          </Field>

          <Field label="Languages known" error={errors.languages?.message}>
            <Controller
              control={control}
              name="languages"
              render={({ field }) => (
                <ChipGroup
                  options={LANGUAGES}
                  value={field.value ?? []}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>
        </div>
      )}

      {/* ---------------- STEP 2 : professional ---------------- */}
      {step === 1 && (
        <div className="space-y-5">
          <Field
            label="Years of experience"
            required
            hint="Fresher-na 0 nu podunga"
            error={errors.experience_years?.message}
          >
            <input
              {...register("experience_years")}
              inputMode="decimal"
              className={inputClass}
              placeholder="3"
            />
          </Field>

          <Field label="Specialization" required error={errors.specializations?.message}>
            <Controller
              control={control}
              name="specializations"
              render={({ field }) => (
                <ChipGroup
                  options={SPECIALIZATIONS}
                  value={field.value ?? []}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>

          <Field label="Certifications" error={errors.certifications?.message}>
            <Controller
              control={control}
              name="certifications"
              render={({ field }) => (
                <ChipGroup
                  options={CERTIFICATIONS}
                  value={field.value ?? []}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Munnadi velai paartha gyms
            </span>
            <div className="space-y-3">
              {gyms.fields.map((f, i) => (
                <div key={f.id} className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      {...register(`previous_gyms.${i}.gym`)}
                      className={inputClass}
                      placeholder="Gym name"
                    />
                    <input
                      {...register(`previous_gyms.${i}.role`)}
                      className={inputClass}
                      placeholder="Role"
                    />
                    <input
                      {...register(`previous_gyms.${i}.from`)}
                      className={inputClass}
                      placeholder="From (2021)"
                    />
                    <input
                      {...register(`previous_gyms.${i}.to`)}
                      className={inputClass}
                      placeholder="To (2024)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => gyms.remove(i)}
                    className="mt-2 text-xs font-medium text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {gyms.fields.length < 5 && (
              <button
                type="button"
                onClick={() => gyms.append({ gym: "", role: "", from: "", to: "" })}
                className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300"
              >
                + Add gym
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---------------- STEP 3 : preferences ---------------- */}
      {step === 2 && (
        <div className="space-y-5">
          <Field label="Job type" error={errors.job_type?.message}>
            <Controller
              control={control}
              name="job_type"
              render={({ field }) => (
                <RadioRow
                  name="job_type"
                  options={JOB_TYPES}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>

          <Field label="Preferred shift" error={errors.preferred_shift?.message}>
            <Controller
              control={control}
              name="preferred_shift"
              render={({ field }) => (
                <RadioRow
                  name="preferred_shift"
                  options={SHIFTS}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Expected salary — min (₹)" error={errors.expected_salary_min?.message}>
              <input
                {...register("expected_salary_min")}
                inputMode="numeric"
                className={inputClass}
                placeholder="18000"
              />
            </Field>
            <Field label="Expected salary — max (₹)" error={errors.expected_salary_max?.message}>
              <input
                {...register("expected_salary_max")}
                inputMode="numeric"
                className={inputClass}
                placeholder="25000"
              />
            </Field>
          </div>

          <Field label="Available from" error={errors.available_from?.message}>
            <input {...register("available_from")} type="date" className={inputClass} />
          </Field>

          <label className="flex items-start gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200">
            <input
              {...register("willing_to_relocate")}
              type="checkbox"
              className="mt-0.5 h-5 w-5 accent-orange-600"
            />
            <span className="text-sm text-slate-700">Vera oorukku relocate panna ready</span>
          </label>
        </div>
      )}

      {/* ---------------- STEP 4 : extras + uploads ---------------- */}
      {step === 3 && (
        <div className="space-y-5">
          <Field
            label="Short bio"
            hint="Ungala patthi 2 line — training style, achievement ethuvum"
            error={errors.bio?.message}
          >
            <textarea {...register("bio")} rows={4} className={inputClass} />
          </Field>

          <Field label="Photo" error={undefined}>
            <FileInput
              accept="image/*"
              files={photo}
              onFiles={pickFiles("photo", setPhoto, 1)}
              hint="Optional · max 5 MB"
            />
          </Field>

          <Field label="Resume (PDF)" error={undefined}>
            <FileInput
              accept="application/pdf,image/*"
              files={resume}
              onFiles={pickFiles("doc", setResume, 1)}
              hint="Optional · resume illaatiyum apply pannalaam"
            />
          </Field>

          <Field label="Certificates" error={undefined}>
            <FileInput
              accept="application/pdf,image/*"
              multiple
              files={certs}
              onFiles={pickFiles("doc", setCerts, MAX_CERTIFICATES)}
              hint={`Optional · max ${MAX_CERTIFICATES} files`}
            />
          </Field>

          <Field label="Instagram link" error={errors.instagram_url?.message}>
            <input
              {...register("instagram_url")}
              className={inputClass}
              placeholder="https://instagram.com/..."
            />
          </Field>

          <Field label="YouTube link" error={errors.youtube_url?.message}>
            <input
              {...register("youtube_url")}
              className={inputClass}
              placeholder="https://youtube.com/..."
            />
          </Field>

          <Field
            label="Reference"
            hint="Yaaravadhu reference irundha peru + number"
            error={errors.reference_contact?.message}
          >
            <input {...register("reference_contact")} className={inputClass} />
          </Field>

          <div>
            <label className="flex items-start gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200">
              <input
                {...register("consent")}
                type="checkbox"
                className="mt-0.5 h-5 w-5 accent-orange-600"
              />
              <span className="text-sm text-slate-700">
                Naan koduthirukra vivarangal ellaam unmai. Gym-la irundhu enna contact pannalaam.
              </span>
            </label>
            {errors.consent && (
              <span className="mt-1 block text-xs font-medium text-rose-600">
                {errors.consent.message}
              </span>
            )}
          </div>

          {fileError && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{fileError}</p>
          )}
          {serverError && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{serverError}</p>
          )}
        </div>
      )}

      {/* ---------------- nav ---------------- */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              disabled={busy}
              className="rounded-xl bg-white px-5 py-3.5 font-semibold text-slate-700 ring-1 ring-slate-300 disabled:opacity-50"
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="flex-1 rounded-xl bg-brand px-5 py-3.5 font-semibold text-white transition hover:opacity-90"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-brand px-5 py-3.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Anupparen..." : "Submit application"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
