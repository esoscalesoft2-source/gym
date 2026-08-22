import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SPECIALIZATIONS, STATUSES, statusMeta } from "@/lib/constants";
import { logout } from "../login/actions";
import { SetupNotice, supabaseConfigured } from "@/components/setup-notice";

export const metadata = { title: "Applications" };

// Never prerender: this page shows one owner's private data, and the setup guard
// below would otherwise get baked into a static build.
export const dynamic = "force-dynamic";

type Search = { status?: string; q?: string; city?: string; spec?: string };

/** PostgREST `or()` treats , ( ) . specially — strip them out of user input. */
const safe = (s: string) => s.replace(/[,()."*\\]/g, "").trim().slice(0, 40);

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  if (!supabaseConfigured) return <SetupNotice />;

  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("trainer_applications")
    .select(
      "id, full_name, phone, city, experience_years, specializations, status, created_at, expected_salary_min, expected_salary_max",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (sp.status && sp.status !== "all") query = query.eq("status", sp.status);
  if (sp.city) query = query.ilike("city", `%${safe(sp.city)}%`);
  if (sp.spec) query = query.contains("specializations", [sp.spec]);
  if (sp.q) {
    const q = safe(sp.q);
    if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const [{ data: rows, error }, { data: allStatuses }] = await Promise.all([
    query,
    supabase.from("trainer_applications").select("status"),
  ]);

  const counts = (allStatuses ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  const total = allStatuses?.length ?? 0;

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-slate-600">{total} total</p>
        </div>
        <form action={logout}>
          <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300">
            Logout
          </button>
        </form>
      </header>

      {/* status tabs */}
      <nav className="mt-6 flex flex-wrap gap-2">
        {[{ value: "all", label: "All" }, ...STATUSES].map((s) => {
          const active = (sp.status ?? "all") === s.value;
          const count = s.value === "all" ? total : (counts[s.value] ?? 0);
          return (
            <Link
              key={s.value}
              href={{ pathname: "/dashboard", query: { ...sp, status: s.value } }}
              className={
                "rounded-full px-4 py-2 text-sm font-medium transition " +
                (active
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-slate-400")
              }
            >
              {s.label} <span className="opacity-60">{count}</span>
            </Link>
          );
        })}
      </nav>

      {/* filters */}
      <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <input type="hidden" name="status" value={sp.status ?? "all"} />
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Name or phone"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
        />
        <input
          name="city"
          defaultValue={sp.city ?? ""}
          placeholder="City"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
        />
        <select
          name="spec"
          defaultValue={sp.spec ?? ""}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
        >
          <option value="">All specializations</option>
          {SPECIALIZATIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error.message}</p>
      )}

      {/* results */}
      {!error && (rows?.length ?? 0) === 0 && (
        <p className="mt-10 rounded-xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-200">
          Innum applications ethuvum illa.
        </p>
      )}

      <ul className="mt-5 space-y-3">
        {rows?.map((r) => {
          const meta = statusMeta(r.status);
          return (
            <li key={r.id}>
              <Link
                href={`/dashboard/${r.id}`}
                className="block rounded-xl bg-white p-4 ring-1 ring-slate-200 transition hover:ring-slate-400"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{r.full_name}</h2>
                    <p className="text-sm text-slate-600">
                      {r.phone} · {r.city} · {r.experience_years} yrs exp
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.tone}`}
                  >
                    {meta.label}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.specializations?.slice(0, 4).map((s: string) => (
                    <span
                      key={s}
                      className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {r.expected_salary_min || r.expected_salary_max
                    ? `₹${r.expected_salary_min ?? "?"} - ₹${r.expected_salary_max ?? "?"} · `
                    : ""}
                  Applied {fmtDate(r.created_at)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
