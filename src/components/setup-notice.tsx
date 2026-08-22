export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function SetupNotice() {
  return (
    <main className="mx-auto max-w-lg px-5 py-24">
      <p className="eyebrow text-sm text-brand">Setup</p>
      <h1 className="display mt-2 text-4xl">Setup innum mudiyala</h1>
      <p className="mt-4 text-sm text-muted">
        <code className="border border-line bg-surface px-1.5 py-0.5 text-brand">.env.local</code>{" "}
        file-la Supabase keys fill pannunga, apparam dev server-a restart pannunga:
      </p>
      <pre className="mt-4 overflow-x-auto border border-line bg-surface p-4 text-xs text-muted">
        {`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_GYM_ID=...`}
      </pre>
      <p className="mt-4 text-sm text-muted">
        Full steps:{" "}
        <code className="border border-line bg-surface px-1.5 py-0.5 text-brand">README.md</code>
      </p>
    </main>
  );
}
