import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATUSES, statusMeta } from "@/lib/constants";
import { BUCKET } from "@/lib/upload";
import { updateApplication } from "../actions";

export const metadata = { title: "Application detail" };

type PrevGym = { gym?: string; role?: string; from?: string; to?: string };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "" ) return null;
  return (
    <div className="flex gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <dt className="w-40 shrink-0 text-sm text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export default async function ApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: app } = await supabase
    .from("trainer_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!app) notFound();

  const { data: history } = await supabase
    .from("application_status_history")
    .select("from_status, to_status, changed_at")
    .eq("application_id", id)
    .order("changed_at", { ascending: false });

  // Private bucket — hand out short-lived signed links.
  const docPaths: string[] = [
    ...(app.photo_path ? [app.photo_path] : []),
    ...(app.resume_path ? [app.resume_path] : []),
    ...((app.certificate_paths as string[] | null) ?? []),
  ];
  const { data: signed } = docPaths.length
    ? await supabase.storage.from(BUCKET).createSignedUrls(docPaths, 3600)
    : { data: [] };

  const urlOf = (path?: string | null): string | undefined =>
    (path ? signed?.find((s) => s.path === path)?.signedUrl : undefined) ?? undefined;

  const meta = statusMeta(app.status);
  const prevGyms = (app.previous_gyms as PrevGym[] | null) ?? [];

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">
        ← All applications
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          {urlOf(app.photo_path) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={urlOf(app.photo_path)}
              alt={app.full_name}
              className="h-16 w-16 rounded-full object-cover ring-1 ring-slate-200"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{app.full_name}</h1>
            <p className="text-sm text-slate-600">
              {app.city} · {app.experience_years} yrs experience
            </p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${meta.tone}`}>
          {meta.label}
        </span>
      </header>

      {/* quick contact */}
      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={`tel:${app.phone}`}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Call {app.phone}
        </a>
        <a
          href={`https://wa.me/91${app.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          WhatsApp
        </a>
        {app.email && (
          <a
            href={`mailto:${app.email}`}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300"
          >
            Email
          </a>
        )}
      </div>

      {/* status + notes */}
      <form
        action={updateApplication}
        className="mt-6 rounded-xl bg-white p-5 ring-1 ring-slate-200"
      >
        <input type="hidden" name="id" value={app.id} />
        <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Status</span>
            <select
              name="status"
              defaultValue={app.status}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Notes</span>
            <textarea
              name="owner_notes"
              rows={3}
              defaultValue={app.owner_notes ?? ""}
              placeholder="Interview feedback, salary discussion..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            />
          </label>
        </div>
        <button className="mt-4 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white">
          Save
        </button>
      </form>

      {/* details */}
      <section className="mt-6 rounded-xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Details
        </h2>
        <dl>
          <Row label="Phone" value={app.phone} />
          <Row label="Email" value={app.email} />
          <Row label="Gender" value={app.gender} />
          <Row label="Date of birth" value={app.dob} />
          <Row label="Address" value={app.address} />
          <Row label="Languages" value={(app.languages ?? []).join(", ")} />
          <Row label="Specializations" value={(app.specializations ?? []).join(", ")} />
          <Row label="Certifications" value={(app.certifications ?? []).join(", ")} />
          <Row label="Job type" value={app.job_type} />
          <Row label="Preferred shift" value={app.preferred_shift} />
          <Row
            label="Expected salary"
            value={
              app.expected_salary_min || app.expected_salary_max
                ? `₹${app.expected_salary_min ?? "?"} - ₹${app.expected_salary_max ?? "?"}`
                : ""
            }
          />
          <Row label="Available from" value={app.available_from} />
          <Row label="Relocate?" value={app.willing_to_relocate ? "Yes" : "No"} />
          <Row label="Bio" value={app.bio} />
          <Row label="Instagram" value={app.instagram_url} />
          <Row label="YouTube" value={app.youtube_url} />
          <Row label="Reference" value={app.reference_contact} />
        </dl>
      </section>

      {prevGyms.length > 0 && (
        <section className="mt-6 rounded-xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Previous gyms
          </h2>
          <ul className="space-y-2">
            {prevGyms.map((g, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium">{g.gym}</span>
                {g.role ? ` — ${g.role}` : ""}
                {g.from || g.to ? (
                  <span className="text-slate-500">{` (${g.from ?? ""}–${g.to ?? ""})`}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(app.resume_path || (app.certificate_paths ?? []).length > 0) && (
        <section className="mt-6 rounded-xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Documents
          </h2>
          <ul className="space-y-2 text-sm">
            {app.resume_path && (
              <li>
                <a
                  href={urlOf(app.resume_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand underline"
                >
                  Resume
                </a>
              </li>
            )}
            {((app.certificate_paths as string[] | null) ?? []).map((p, i) => (
              <li key={p}>
                <a
                  href={urlOf(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand underline"
                >
                  Certificate {i + 1}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(history?.length ?? 0) > 0 && (
        <section className="mt-6 rounded-xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            History
          </h2>
          <ul className="space-y-1.5 text-sm text-slate-600">
            {history?.map((h, i) => (
              <li key={i}>
                {h.from_status} → <span className="font-medium">{h.to_status}</span>
                <span className="text-slate-400">
                  {" "}
                  · {new Date(h.changed_at).toLocaleString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
