import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATUSES, statusMeta } from "@/lib/constants";
import { BUCKET } from "@/lib/upload";
import { updateApplication } from "../actions";

export const metadata = { title: "Application detail" };

type PrevGym = { gym?: string; role?: string; from?: string; to?: string };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex gap-4 border-b border-line py-2.5 last:border-0">
      <dt className="w-40 shrink-0 text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-surface p-5">
      <h2 className="eyebrow mb-3 text-xs text-brand">{title}</h2>
      {children}
    </section>
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
  const certPaths = (app.certificate_paths as string[] | null) ?? [];

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <Link
        href="/dashboard"
        className="text-xs uppercase tracking-wider text-muted transition hover:text-foreground"
      >
        ← All applications
      </Link>

      <header className="mt-5 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div className="flex items-center gap-4">
          {urlOf(app.photo_path) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={urlOf(app.photo_path)}
              alt={app.full_name}
              className="h-20 w-20 border border-line object-cover"
            />
          )}
          <div>
            <h1 className="display text-4xl">{app.full_name}</h1>
            <p className="mt-1 text-sm text-muted">
              {app.city} · {app.experience_years} yrs experience
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ring-1 ${meta.tone}`}
        >
          {meta.label}
        </span>
      </header>

      {/* quick contact */}
      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={`tel:${app.phone}`}
          className="eyebrow bg-brand px-5 py-2.5 text-sm text-brand-ink transition hover:brightness-110"
        >
          Call {app.phone}
        </a>
        <a
          href={`https://wa.me/91${app.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-sm text-emerald-300 transition hover:bg-emerald-500/20"
        >
          WhatsApp
        </a>
        {app.email && (
          <a
            href={`mailto:${app.email}`}
            className="eyebrow border border-line bg-surface px-5 py-2.5 text-sm text-muted transition hover:text-foreground"
          >
            Email
          </a>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        {/* ---------------- left column ---------------- */}
        <div className="space-y-5">
          <Panel title="Details">
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
          </Panel>

          {prevGyms.length > 0 && (
            <Panel title="Previous gyms">
              <ul className="space-y-2">
                {prevGyms.map((g, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-semibold text-foreground">{g.gym}</span>
                    {g.role ? <span className="text-muted"> — {g.role}</span> : null}
                    {g.from || g.to ? (
                      <span className="text-muted">{` (${g.from ?? ""}–${g.to ?? ""})`}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        {/* ---------------- right column ---------------- */}
        <div className="space-y-5">
          <form action={updateApplication} className="border border-line bg-surface p-5">
            <input type="hidden" name="id" value={app.id} />
            <h2 className="eyebrow mb-3 text-xs text-brand">Pipeline</h2>

            <label className="block">
              <span className="eyebrow mb-2 block text-xs text-muted">Status</span>
              <select
                name="status"
                defaultValue={app.status}
                className="w-full border border-line bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="eyebrow mb-2 block text-xs text-muted">Notes</span>
              <textarea
                name="owner_notes"
                rows={5}
                defaultValue={app.owner_notes ?? ""}
                placeholder="Interview feedback, salary discussion..."
                className="w-full border border-line bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted/60 focus:border-brand"
              />
            </label>

            <button className="eyebrow mt-4 w-full bg-brand px-5 py-2.5 text-sm text-brand-ink transition hover:brightness-110">
              Save
            </button>
          </form>

          {(app.resume_path || certPaths.length > 0) && (
            <Panel title="Documents">
              <ul className="space-y-2 text-sm">
                {app.resume_path && (
                  <li>
                    <a
                      href={urlOf(app.resume_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand underline underline-offset-4"
                    >
                      Resume
                    </a>
                  </li>
                )}
                {certPaths.map((p, i) => (
                  <li key={p}>
                    <a
                      href={urlOf(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand underline underline-offset-4"
                    >
                      Certificate {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {(history?.length ?? 0) > 0 && (
            <Panel title="History">
              <ul className="space-y-2 text-sm">
                {history?.map((h, i) => (
                  <li key={i} className="border-l border-line pl-3 text-muted">
                    {h.from_status} → <span className="text-foreground">{h.to_status}</span>
                    <span className="block text-xs">
                      {new Date(h.changed_at).toLocaleString("en-IN")}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </main>
  );
}
