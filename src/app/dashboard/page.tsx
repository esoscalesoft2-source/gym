import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SPECIALIZATIONS, STATUSES, statusMeta } from "@/lib/constants";
import { logout } from "../login/actions";
import { SetupNotice, supabaseConfigured } from "@/components/setup-notice";

export const metadata = { title: "Applications" };

// Never prerender: this page shows one owner's private data, and the setup guard
// below would otherwise get baked into a static build.
export const dynamic = "force-dynamic";

const gymName = process.env.NEXT_PUBLIC_GYM_NAME || "Our Gym";

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

function salaryRange(min: number | null, max: number | null) {
  if (!min && !max) return "—";
  return `₹${min ?? "?"} - ₹${max ?? "?"}`;
}

const filterInput =
  "w-full border border-line bg-surface px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted/60 focus:border-brand";

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
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
          <div className="flex items-baseline gap-3">
            <span className="display text-lg">
              <span className="text-brand">◆</span> {gymName}
            </span>
            <span className="hidden text-xs uppercase tracking-wider text-muted sm:inline">
              Applications
            </span>
          </div>
          <form action={logout}>
            <button className="eyebrow border border-line bg-surface px-3.5 py-1.5 text-xs text-muted transition hover:border-muted hover:text-foreground">
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        <h1 className="display text-4xl">
          {total} <span className="text-brand">applications</span>
        </h1>

        {/* status tabs */}
        <nav className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
          {[{ value: "all", label: "All" }, ...STATUSES].map((s) => {
            const active = (sp.status ?? "all") === s.value;
            const count = s.value === "all" ? total : (counts[s.value] ?? 0);
            return (
              <Link
                key={s.value}
                href={{ pathname: "/dashboard", query: { ...sp, status: s.value } }}
                className={
                  "shrink-0 border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition " +
                  (active
                    ? "border-brand bg-brand text-brand-ink"
                    : "border-line bg-surface text-muted hover:border-muted hover:text-foreground")
                }
              >
                {s.label} <span className="opacity-60">{count}</span>
              </Link>
            );
          })}
        </nav>

        {/* filters */}
        <form className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <input type="hidden" name="status" value={sp.status ?? "all"} />
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Name or phone"
            className={filterInput}
          />
          <input name="city" defaultValue={sp.city ?? ""} placeholder="City" className={filterInput} />
          <select name="spec" defaultValue={sp.spec ?? ""} className={filterInput}>
            <option value="">All specializations</option>
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button className="eyebrow bg-brand px-6 py-2.5 text-sm text-brand-ink transition hover:brightness-110">
            Filter
          </button>
        </form>

        {error && (
          <p className="mt-6 border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error.message}
          </p>
        )}

        {!error && (rows?.length ?? 0) === 0 && (
          <p className="mt-10 border border-line bg-surface p-10 text-center text-muted">
            Innum applications ethuvum illa.
          </p>
        )}

        {/* ---------- desktop table ---------- */}
        {(rows?.length ?? 0) > 0 && (
          <div className="mt-5 hidden overflow-x-auto border border-line lg:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">Exp</th>
                  <th className="px-4 py-3 font-semibold">Specializations</th>
                  <th className="px-4 py-3 font-semibold">Expected</th>
                  <th className="px-4 py-3 font-semibold">Applied</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows?.map((r) => {
                  const meta = statusMeta(r.status);
                  return (
                    <tr
                      key={r.id}
                      className="border-t border-line bg-surface transition hover:bg-surface-2"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/${r.id}`}
                          className="font-semibold text-foreground transition hover:text-brand"
                        >
                          {r.full_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">{r.phone}</td>
                      <td className="px-4 py-3 text-muted">{r.city}</td>
                      <td className="px-4 py-3 text-muted">{r.experience_years} yrs</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.specializations?.slice(0, 3).map((s: string) => (
                            <span
                              key={s}
                              className="border border-line px-1.5 py-0.5 text-[11px] text-muted"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {salaryRange(r.expected_salary_min, r.expected_salary_max)}
                      </td>
                      <td className="px-4 py-3 text-muted">{fmtDate(r.created_at)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 ${meta.tone}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------- mobile cards ---------- */}
        <ul className="mt-5 space-y-3 lg:hidden">
          {rows?.map((r) => {
            const meta = statusMeta(r.status);
            return (
              <li key={r.id}>
                <Link
                  href={`/dashboard/${r.id}`}
                  className="block border border-line bg-surface p-4 transition hover:border-brand"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="display text-xl">{r.full_name}</h2>
                      <p className="mt-0.5 text-sm text-muted">
                        {r.phone} · {r.city} · {r.experience_years} yrs
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 ${meta.tone}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {r.specializations?.slice(0, 4).map((s: string) => (
                      <span
                        key={s}
                        className="border border-line px-2 py-0.5 text-[11px] text-muted"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <p className="mt-2.5 text-xs text-muted">
                    {salaryRange(r.expected_salary_min, r.expected_salary_max)} · Applied{" "}
                    {fmtDate(r.created_at)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
