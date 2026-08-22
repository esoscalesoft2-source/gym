export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function SetupNotice() {
  return (
    <main className="mx-auto max-w-lg px-5 py-20">
      <h1 className="text-xl font-bold">Setup innum mudiyala</h1>
      <p className="mt-3 text-sm text-slate-600">
        <code className="rounded bg-slate-200 px-1.5 py-0.5">.env.local</code> file-la Supabase
        keys fill pannunga, apparam dev server-a restart pannunga:
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
        {`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_GYM_ID=...`}
      </pre>
      <p className="mt-4 text-sm text-slate-500">
        Full steps: <code className="rounded bg-slate-200 px-1.5 py-0.5">README.md</code>
      </p>
    </main>
  );
}
