"use server";

import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { firebaseAdminConfigured } from "@/lib/firebase/config";
import { COL, phoneLockId } from "@/lib/firebase/data";
import { applicationSchema, uploadPathsSchema } from "@/lib/validation";

export type SubmitResult = { ok: true; ref: number } | { ok: false; message: string };

const emptyToNull = (v: string) => (v.trim() === "" ? null : v.trim());
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

export async function submitApplication(raw: unknown, rawPaths: unknown): Promise<SubmitResult> {
  const gymId = process.env.NEXT_PUBLIC_GYM_ID;
  if (!gymId) {
    return { ok: false, message: "Site setup incomplete — NEXT_PUBLIC_GYM_ID missing." };
  }
  if (!firebaseAdminConfigured) {
    return { ok: false, message: "Site setup incomplete — Firebase keys missing." };
  }

  // Never trust the client: re-run the exact same schema on the server.
  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Something in the form is not valid. Please check and try again." };
  }
  const paths = uploadPathsSchema.safeParse(rawPaths);
  if (!paths.success) {
    return { ok: false, message: "File upload failed. Please try again." };
  }

  const d = parsed.data;

  // Everything below talks to Firestore, wrapped as one block so any failure — a bad
  // credential, a missing index, a network blip — degrades to a plain message instead
  // of an unhandled throw. An unhandled throw in a Server Action gets redacted by
  // Next.js on the client to an opaque "Minified React error #441", which leaves the
  // applicant stuck with no explanation and us with nothing to debug beyond a hunch.
  try {
    const db = adminDb();

    // Attach the currently open job post, if the gym has one.
    let jobPostId: string | null = null;
    try {
      const post = await db
        .collection(COL.jobPosts)
        .where("gym_id", "==", gymId)
        .where("is_active", "==", true)
        .orderBy("created_at", "desc")
        .limit(1)
        .get();
      jobPostId = post.empty ? null : post.docs[0].id;
    } catch {
      // No job_posts collection or no index yet — an application without a post is fine.
      jobPostId = null;
    }

    const doc = {
      gym_id: gymId,
      job_post_id: jobPostId,

      full_name: d.full_name,
      gender: emptyToNull(d.gender),
      dob: emptyToNull(d.dob),
      phone: d.phone,
      email: emptyToNull(d.email),
      city: d.city,
      // Lower-cased copy so the dashboard can filter by city without a case-sensitive match.
      city_lower: d.city.trim().toLowerCase(),
      address: emptyToNull(d.address),
      languages: d.languages,
      photo_path: emptyToNull(paths.data.photo_path),

      experience_years: Number(d.experience_years),
      specializations: d.specializations,
      // Firestore has no enum constraint, so swap the generic "Other" chip for what the
      // applicant actually typed — the dashboard just joins this array for display.
      certifications: d.certifications.map((c) =>
        c === "Other" && d.certification_other.trim()
          ? `Other: ${d.certification_other.trim()}`
          : c,
      ),
      certificate_paths: paths.data.certificate_paths,
      resume_path: emptyToNull(paths.data.resume_path),
      previous_gyms: d.previous_gyms.filter((g) => g.gym.trim() !== ""),

      job_type: emptyToNull(d.job_type),
      preferred_shift: emptyToNull(d.preferred_shift),
      expected_salary: numOrNull(d.expected_salary),
      available_from: emptyToNull(d.available_from),
      available_timings: d.available_timings,
      willing_to_relocate: d.willing_to_relocate,

      bio: emptyToNull(d.bio),
      instagram_url: emptyToNull(d.instagram_url),
      youtube_url: emptyToNull(d.youtube_url),
      reference_contact: emptyToNull(d.reference_contact),

      status: "new",
      owner_notes: null,
      created_at: FieldValue.serverTimestamp(),
    };

    const appRef = db.collection(COL.applications).doc();
    const lockRef = db.collection(COL.phoneLocks).doc(phoneLockId(gymId, d.phone));
    const gymRef = db.collection("gyms").doc(gymId);

    // Firestore has no unique index, so a lock document stands in for the old
    // (gym_id, phone) constraint. The transaction makes the check-then-write atomic.
    const refNo = await db.runTransaction(async (tx) => {
      // Every read must happen before the first write in a Firestore transaction.
      const [lock, gym] = await Promise.all([tx.get(lockRef), tx.get(gymRef)]);
      if (lock.exists) throw new Error("DUPLICATE_PHONE");

      // Running number per gym. Kept in the transaction so two people applying at
      // the same moment can never be handed the same one.
      const next = Number(gym.get("application_seq") ?? 0) + 1;
      tx.set(gymRef, { application_seq: next }, { merge: true });

      tx.create(appRef, { ...doc, ref_no: next });
      tx.create(lockRef, {
        gym_id: gymId,
        phone: d.phone,
        application_id: appRef.id,
        created_at: FieldValue.serverTimestamp(),
      });

      return next;
    });

    return { ok: true, ref: refNo };
  } catch (e) {
    if (e instanceof Error && e.message === "DUPLICATE_PHONE") {
      return {
        ok: false,
        message: "You have already applied with this number. We will call you!",
      };
    }
    console.error("[submitApplication]", e);
    return { ok: false, message: "Could not save your application. Please try again in a moment." };
  }
}
