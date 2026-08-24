"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { submitApplication } from "./actions";

import {
  AVAILABLE_TIMINGS,
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
import { checkFile, uploadFile } from "@/lib/upload";
import { uploadsEnabled } from "@/lib/firebase/config";
import {
  CheckboxCard,
  ChipGroup,
  Field,
  FileInput,
  RadioRow,
  inputClass,
} from "@/components/form-fields";

const STEPS = ["Your details", "Experience", "Job preference", "Last step"];

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
  certification_other: "",
  previous_gyms: [],
  job_type: "",
  preferred_shift: "",
  expected_salary_min: "",
  expected_salary_max: "",
  available_from: "",
  available_timings: [],
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
  const watchCertifications = useWatch({ control, name: "certifications" });
  const watchExperience = useWatch({ control, name: "experience_years" });
  const experienceRequiresGym = Number(watchExperience) >= 1;

  /**
   * Cross-field rules live in a top-level zod `.refine()`, which zod skips while any
   * field is still invalid (`consent` is empty until the last step). So they never fire
   * on a per-step `trigger()` — check them here too, otherwise the user only finds out
   * at submit time.
   */
  const checkStepExtras = () => {
    if (step === 1) {
      const { certifications, certification_other, experience_years, previous_gyms } =
        getValues();

      if (certifications?.includes("Other") && !certification_other?.trim()) {
        setError("certification_other", { message: "Enter your certification" });
        return false;
      }
      clearErrors("certification_other");

      const hasExperience = Number(experience_years) >= 1;
      const hasAGym = (previous_gyms ?? []).some((g) => g.gym?.trim());
      if (hasExperience && !hasAGym) {
        setError("previous_gyms", { message: "Add at least one gym you have worked at" });
        return false;
      }
      clearErrors("previous_gyms");
    }

    if (step === 2) {
      const { expected_salary_min: min, expected_salary_max: max } = getValues();
      if (min && max && Number(min) > Number(max)) {
        setError("expected_salary_max", {
          message: "Minimum salary is higher than the maximum",
        });
        return false;
      }
      clearErrors("expected_salary_max");
    }

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

  // Warm the success route while the applicant is still on the last step, so the
  // submit button is not left spinning through a first-visit compile in dev.
  useEffect(() => {
    if (step === STEPS.length - 1) router.prefetch("/apply/success");
  }, [step, router]);

  const onSubmit = async (values: ApplicationValues) => {
    setServerError(null);
    setBusy(true);
    try {
      const [photo_path, resume_path, certificate_paths] = uploadsEnabled
        ? await Promise.all([
            photo[0] ? uploadFile(photo[0], "photos") : Promise.resolve(""),
            resume[0] ? uploadFile(resume[0], "resumes") : Promise.resolve(""),
            Promise.all(certs.map((f) => uploadFile(f, "certificates"))),
          ])
        : ["", "", [] as string[]];

      const res = await submitApplication(values, {
        photo_path,
        resume_path,
        certificate_paths,
      });

      if (res.ok) router.push(`/apply/success?ref=${res.ref}`);
      else setServerError(res.message);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="pb-24">
      {/* progress */}
      <div className="mb-8">
        <div className="eyebrow flex items-center justify-between text-xs">
          <span className="text-brand">
            Step {step + 1} / {STEPS.length}
          </span>
          <span className="text-muted">{STEPS[step]}</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden bg-line">
          <div
            className="h-full bg-brand transition-all duration-300"
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
            hint="This is the number we call or WhatsApp you on"
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
            hint="Enter 0 if you are a fresher"
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

          {watchCertifications?.includes("Other") && (
            <Field
              label="Which certification?"
              required
              error={errors.certification_other?.message}
            >
              <input
                {...register("certification_other")}
                className={inputClass}
                placeholder="e.g. CrossFit Level 1"
                autoFocus
              />
            </Field>
          )}

          <div>
            <span className="eyebrow mb-2 block text-xs text-muted">
              Gyms you have worked at
              {experienceRequiresGym && <span className="text-brand"> *</span>}
            </span>
            {!experienceRequiresGym && (
              <span className="mb-2 block text-xs text-muted">
                Optional for freshers
              </span>
            )}
            <div className="space-y-3">
              {gyms.fields.map((f, i) => (
                <div key={f.id} className="border border-line bg-surface p-3">
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
                    className="eyebrow mt-2 text-xs text-rose-400"
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
                className="eyebrow mt-3 border border-line bg-surface px-4 py-2.5 text-xs text-brand transition hover:border-brand"
              >
                + Add gym
              </button>
            )}
            {!Array.isArray(errors.previous_gyms) && errors.previous_gyms?.message && (
              <span className="mt-1.5 block text-xs font-medium text-rose-400">
                {errors.previous_gyms.message}
              </span>
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

          <Field
            label="Available timings"
            hint="Select every slot you can take"
            error={errors.available_timings?.message}
          >
            <Controller
              control={control}
              name="available_timings"
              render={({ field }) => (
                <ChipGroup
                  options={AVAILABLE_TIMINGS}
                  value={field.value ?? []}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>

          <Field label="Available from" error={errors.available_from?.message}>
            <input {...register("available_from")} type="date" className={inputClass} />
          </Field>

          <CheckboxCard {...register("willing_to_relocate")}>
            Ready to relocate to another city
          </CheckboxCard>
        </div>
      )}

      {/* ---------------- STEP 4 : extras + uploads ---------------- */}
      {step === 3 && (
        <div className="space-y-5">
          <Field
            label="Short bio"
            hint="Two lines about you — training style, achievements, anything"
            error={errors.bio?.message}
          >
            <textarea {...register("bio")} rows={4} className={inputClass} />
          </Field>

          {!uploadsEnabled && (
            <p className="border border-line bg-surface p-3 text-xs text-muted">
              File uploads are turned off for now — send your photo, resume and
              certificates over WhatsApp after we call you.
            </p>
          )}

          {uploadsEnabled && (
            <>
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
              hint="Optional · you can apply without a resume"
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

            </>
          )}

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
            hint="If you have a reference, add their name and number"
            error={errors.reference_contact?.message}
          >
            <input {...register("reference_contact")} className={inputClass} />
          </Field>

          <div>
            <CheckboxCard {...register("consent")}>
              Everything I have entered is true. The gym may contact me about this application.
            </CheckboxCard>
            {errors.consent && (
              <span className="mt-1.5 block text-xs font-medium text-rose-400">
                {errors.consent.message}
              </span>
            )}
          </div>

          {fileError && (
            <p className="border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {fileError}
            </p>
          )}
          {serverError && (
            <p className="border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {serverError}
            </p>
          )}
        </div>
      )}

      {/* ---------------- nav ---------------- */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              disabled={busy}
              className="display border border-line bg-surface px-6 py-3.5 text-lg text-muted transition hover:text-foreground disabled:opacity-50"
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="display flex-1 bg-brand px-5 py-3.5 text-lg text-brand-ink transition hover:brightness-110"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={busy}
              className="display flex-1 bg-brand px-5 py-3.5 text-lg text-brand-ink transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? "Sending..." : "Submit application"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
