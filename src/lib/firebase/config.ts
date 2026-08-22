/**
 * Firebase config read from the environment.
 *
 * The NEXT_PUBLIC_* values are safe to ship to the browser — Firebase treats them
 * as a project address, not a secret. Access is controlled by `firestore.rules`
 * and `storage.rules`, so those files are the real security boundary.
 *
 * FIREBASE_SERVICE_ACCOUNT_KEY is server-only and must never be prefixed with
 * NEXT_PUBLIC_ — it bypasses every rule.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

/** True once the browser-side keys are present. */
export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.storageBucket,
);

/** True once the server can also talk to Firebase with admin rights. */
export const firebaseAdminConfigured = Boolean(
  firebaseConfigured && process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
);

/**
 * Cloud Storage needs the Blaze plan, so a project can be fully working without a
 * bucket. Uploading to a bucket that does not exist does not fail fast — the SDK
 * retries until the browser gives up — so the upload fields are opt-in.
 */
export const uploadsEnabled =
  firebaseConfigured && process.env.NEXT_PUBLIC_UPLOADS_ENABLED === "true";

/** Session cookie name — set on login, read by `proxy.ts`. */
export const SESSION_COOKIE = "gym_session";

/** How long a login lasts before the owner has to sign in again. */
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
