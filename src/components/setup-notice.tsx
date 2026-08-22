import { firebaseAdminConfigured, firebaseConfigured } from "@/lib/firebase/config";

/** Public keys only — safe to evaluate in a Client Component. */
export { firebaseConfigured };

/** Public keys + the service account. Server Components / Actions only. */
export { firebaseAdminConfigured };

export function SetupNotice() {
  return (
    <main className="mx-auto max-w-lg px-5 py-24">
      <p className="eyebrow text-sm text-brand">Setup</p>
      <h1 className="display mt-2 text-4xl">Setup not finished</h1>
      <p className="mt-4 text-sm text-muted">
        Fill in your Firebase keys in{" "}
        <code className="border border-line bg-surface px-1.5 py-0.5 text-brand">.env.local</code>,
        then restart the dev server:
      </p>
      <pre className="mt-4 overflow-x-auto border border-line bg-surface p-4 text-xs text-muted">
        {`NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_SERVICE_ACCOUNT_KEY=...
NEXT_PUBLIC_GYM_ID=...`}
      </pre>
      <p className="mt-4 text-sm text-muted">
        Full steps:{" "}
        <code className="border border-line bg-surface px-1.5 py-0.5 text-brand">
          firebase/seed.md
        </code>
      </p>
    </main>
  );
}
