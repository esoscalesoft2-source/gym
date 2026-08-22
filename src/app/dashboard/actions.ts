"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { COL } from "@/lib/firebase/data";
import { ownsGym } from "@/lib/firebase/owner";
import { STATUSES } from "@/lib/constants";
import { currentUid } from "../login/actions";

const VALID = STATUSES.map((s) => s.value) as string[];
const GYM_ID = process.env.NEXT_PUBLIC_GYM_ID ?? "";

export async function updateApplication(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("owner_notes") ?? "");

  if (!id || !VALID.includes(status)) return;

  // The Admin SDK ignores firestore.rules, so authorisation is enforced here.
  const uid = await currentUid();
  if (!(await ownsGym(uid, GYM_ID))) return;

  const db = adminDb();
  const ref = db.collection(COL.applications).doc(id);

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("NOT_FOUND");
      if (snap.get("gym_id") !== GYM_ID) throw new Error("WRONG_GYM");

      const from = String(snap.get("status") ?? "new");

      tx.update(ref, {
        status,
        owner_notes: notes.trim() || null,
        updated_at: FieldValue.serverTimestamp(),
      });

      // Postgres did this with a trigger; in Firestore it is an explicit write.
      if (from !== status) {
        tx.create(ref.collection(COL.statusHistory).doc(), {
          from_status: from,
          to_status: status,
          changed_by: uid,
          changed_at: FieldValue.serverTimestamp(),
        });
      }
    });
  } catch (e) {
    console.error("[updateApplication]", e);
    return;
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
}
