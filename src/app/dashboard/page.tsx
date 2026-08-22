import Link from "next/link";

import { adminDb } from "@/lib/firebase/admin";
import { COL, toPlain } from "@/lib/firebase/data";
import { ownsGym } from "@/lib/firebase/owner";
import { SPECIALIZATIONS, STATUSES, formatRef, statusMeta } from "@/lib/constants";
import { currentUid, logout } from "../login/actions";
import { SetupNotice, firebaseAdminConfigured } from "@/components/setup-notice";

export const metadata = { title: "Applications" };

// Never prerender: this page shows one owner's private data, and the setup guard
// below would otherwise get baked into a static build.
export const dynamic = "force-dynamic";

const gymName = process.env.NEXT_PUBLIC_GYM_NAME || "Our Gym";
const GYM_ID = process.env.NEXT_PUBLIC_GYM_ID ?? "";

/**
 * Firestore cannot do `ILIKE %x%`, nor OR across two different fields, so the
 * name/phone/city/specialization filters run in memory over the newest N rows.
 * Bump this (and add composite indexes) if a gym ever gets past a few hundred.
 */
const MAX_ROWS = 500;

type Search = { status?: string; q?: string; city?: string; spec?: string };

type Row = {
  id: string;
  ref_no?: number;
  full_name: string;
  phone: string;
  city: string;
  city_lower?: string;
  experience_years: number;
  specializations?: string[];
  status: string;
  created_at?: string;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
};

const safe = (s: string) => s.trim().slice(0, 40).toLowerCase();

function fmtDate(iso?: string) {
  if (!iso) return "—";
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

/**
 * Signed in, but this account is not listed in `gyms/{GYM_ID}.owner_uids`.
 * Rendered inline rather than redirected: proxy.ts sends signed-in users at
 * /login straight back to /dashboard, so a redirect here would loop forever.
 */
function NotOwner() {
  return (
    <main className="mx-auto max-w-lg px-5 py-24">
      <p className="eyebrow text-sm text-brand">403</p>
      <h1 className="display mt-2 text-4xl">You do not have access</h1>
      <p className="mt-4 text-sm text-muted">
        This account is not in the gym&apos;s owner list. In Firestore, add your Firebase Auth
        UID to the{" "}
        <code className="border border-line bg-surface px-1.5 py-0.5 text-brand">
          gyms/{GYM_ID}
        </code>{" "}
        document&apos;s{" "}
        <code className="border border-line bg-surface px-1.5 py-0.5 text-brand">owner_uids</code>{" "}
        array.
      </p>
      <form action={logout} className="mt-8">
        <button className="eyebrow border border-line bg-surface px-4 py-2 text-xs text-muted transition hover:text-foreground">
          Logout
        </button>
      </form>
    </main>
  );
}

const filterInput =
  "w-full border border-line bg-surface px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted/60 focus:border-brand";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  if (!firebaseAdminConfigured || !GYM_ID) return <SetupNotice />;

  // proxy.ts already blocks anonymous visitors; this stops a *signed-in stranger*
  // from reading another gym's applications, which the Admin SDK would otherwise allow.
  const uid = await currentUid();
  if (!(await ownsGym(uid, GYM_ID))) return <NotOwner />;

  const sp = await searchParams;
  const db = adminDb();
  const col = db.collection(COL.applications);

  let fetched: Row[] = [];
  let baseCounts: Record<string, number> = {};
  let baseTotal = 0;
  let error: string | null = null;

  try {
    const [snap, statusSnap] = await Promise.all([
      col.where("gym_id", "==", GYM_ID).orderBy("created_at", "desc").limit(MAX_ROWS).get(),
      // Field mask keeps this cheap — only the status column comes back.
      col.where("gym_id", "==", GYM_ID).select("status").get(),
    ]);

    fetched = snap.docs.map((d) => ({ ...toPlain(d.data()), id: d.id }) as Row);

    baseTotal = statusSnap.size;
    baseCounts = statusSnap.docs.reduce<Record<string, number>>((acc, d) => {
      const s = String(d.get("status") ?? "new");
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {});
  } catch (e) {
    // Almost always a missing composite index — Firestore puts a create-it link
    // in the message, so surface it verbatim rather than swallowing it.
    error = e instanceof Error ? e.message : "The Firestore query failed.";
  }

  // ---- search / city / specialization run in memory (see MAX_ROWS above) ----
  // Deliberately applied BEFORE the status split, so the status tab counts
  // describe the rows you are actually looking at rather than the whole table.
  let matched = fetched;

  if (sp.city) {
    const c = safe(sp.city);
    if (c) matched = matched.filter((r) => (r.city_lower ?? r.city.toLowerCase()).includes(c));
  }
  if (sp.spec) matched = matched.filter((r) => (r.specializations ?? []).includes(sp.spec!));
  if (sp.q) {
    const q = safe(sp.q);
    if (q) {
      // "#0042", "0042" and "42" should all find application 42.
      const asRef = q.replace(/^#/, "").replace(/^0+/, "");
      matched = matched.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          (asRef !== "" && String(r.ref_no ?? "") === asRef),
      );
    }
  }

  const filtersActive = Boolean(sp.q || sp.city || sp.spec);

  // With no filters the counts come from the cheap all-documents query, so they
  // stay correct even past MAX_ROWS. With filters they must describe `matched`.
  const counts = filtersActive
    ? matched.reduce<Record<string, number>>((acc, r) => {
        acc[r.status] = (acc[r.status] ?? 0) + 1;
        return acc;
      }, {})
    : baseCounts;
  const total = filtersActive ? matched.length : baseTotal;

  const rows =
    sp.status && sp.status !== "all" ? matched.filter((r) => r.status === sp.status) : matched;

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
            placeholder="Name, phone or #ref"
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
          <div className="flex gap-2">
            <button className="eyebrow bg-brand px-6 py-2.5 text-sm text-brand-ink transition hover:brightness-110">
              Filter
            </button>
            {filtersActive && (
              <Link
                href={{ pathname: "/dashboard", query: { status: sp.status ?? "all" } }}
                className="eyebrow flex items-center border border-line bg-surface px-4 py-2.5 text-sm text-muted transition hover:border-muted hover:text-foreground"
              >
                Clear
              </Link>
            )}
          </div>
        </form>

        {error && (
          <p className="mt-6 overflow-x-auto border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error}
          </p>
        )}

        {!error && rows.length === 0 && (
          <div className="mt-10 border border-line bg-surface p-10 text-center">
            <p className="text-muted">
              {filtersActive || (sp.status && sp.status !== "all")
                ? "No applications match these filters."
                : "No applications yet."}
            </p>
            {(filtersActive || (sp.status && sp.status !== "all")) && (
              <Link
                href="/dashboard"
                className="eyebrow mt-4 inline-block border border-line px-4 py-2 text-xs text-brand transition hover:border-brand"
              >
                Show all applications
              </Link>
            )}
          </div>
        )}

        {/* ---------- desktop table ---------- */}
        {rows.length > 0 && (
          <div className="mt-5 hidden overflow-x-auto border border-line lg:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ref</th>
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
                {rows.map((r) => {
                  const meta = statusMeta(r.status);
                  return (
                    <tr
                      key={r.id}
                      className="border-t border-line bg-surface transition hover:bg-surface-2"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-brand">
                        {formatRef(r.ref_no)}
                      </td>
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
          {rows.map((r) => {
            const meta = statusMeta(r.status);
            return (
              <li key={r.id}>
                <Link
                  href={`/dashboard/${r.id}`}
                  className="block border border-line bg-surface p-4 transition hover:border-brand"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-brand">{formatRef(r.ref_no)}</p>
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
