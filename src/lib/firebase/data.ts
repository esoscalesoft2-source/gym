import "server-only";

import { Timestamp } from "firebase-admin/firestore";

/** Firestore collection names — one place so a rename can't drift. */
export const COL = {
  applications: "applications",
  /** Sub-collection under an application document. */
  statusHistory: "status_history",
  /** One doc per (gym, phone) pair. Firestore has no unique index, so this stands in. */
  phoneLocks: "phone_locks",
  jobPosts: "job_posts",
} as const;

/** Deterministic id that makes "one application per phone per gym" enforceable. */
export function phoneLockId(gymId: string, phone: string) {
  // Firestore ids may not contain "/" — gym ids and phone numbers never do.
  return `${gymId}_${phone}`;
}

/**
 * Server Components may only hand plain JSON to the client, but Firestore returns
 * Timestamps and nested objects. Convert Timestamps to ISO strings and leave the
 * rest untouched.
 */
export function toPlain<T = Record<string, unknown>>(data: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      out[key] = value.toDate().toISOString();
    } else if (Array.isArray(value)) {
      out[key] = value.map((v) =>
        v instanceof Timestamp ? v.toDate().toISOString() : v,
      );
    } else {
      out[key] = value;
    }
  }
  return out as T;
}
