import "server-only";

import { adminDb } from "./admin";

/**
 * Supabase enforced "this row belongs to a gym you own" with RLS, in the database.
 * The Firebase Admin SDK deliberately bypasses `firestore.rules`, so that check has
 * to live here instead — every dashboard read must go through this function.
 *
 * The gym document is expected to look like:
 *   gyms/{gymId} = { name: "...", owner_uids: ["<auth uid>"] }
 */
export async function ownsGym(uid: string | null, gymId: string): Promise<boolean> {
  if (!uid || !gymId) return false;

  const gym = await adminDb().collection("gyms").doc(gymId).get();
  if (!gym.exists) return false;

  const owners = gym.get("owner_uids");
  return Array.isArray(owners) && owners.includes(uid);
}
