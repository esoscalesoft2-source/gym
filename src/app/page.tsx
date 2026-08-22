import Link from "next/link";
import { SPECIALIZATIONS } from "@/lib/constants";
import { SiteFooter, SiteHeader } from "@/components/site-header";

const gymName = process.env.NEXT_PUBLIC_GYM_NAME || "Our Gym";
const gymCity = process.env.NEXT_PUBLIC_GYM_CITY || "";

const STEPS = [
  {
    title: "Submit application",
    body: "Quick form to outline your experience and certifications.",
    icon: (
      <path d="M4 3h9l4 4v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm8 1v4h4M6 12h8M6 15h5" />
    ),
  },
  {
    title: "Practical assessment",
    body: "Show your skills on the floor with our head coaches.",
    icon: <path d="M3 10h2m14 0h2M6 6v8m8-8v8M6 10h8M9 7v6m2-6v6" />,
  },
  {
    title: "Join the clan",
    body: "Get on the floor and start leading the community.",
    icon: <path d="M10 2 3 6v5c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6l-7-4Zm-3 8 2 2 4-4" />,
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ---------------- hero ---------------- */}
        <section className="relative overflow-hidden border-b border-line">
          {/* Placeholder backdrop — drop a real gym photo in here later. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(120%_90%_at_80%_0%,#2a2a2a_0%,#0d0d0d_60%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.12] [background-image:repeating-linear-gradient(115deg,#cfff00_0px,#cfff00_1px,transparent_1px,transparent_14px)]"
          />

          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-28">
            <div>
              <p className="eyebrow text-sm text-brand">
                {gymCity ? `${gymCity} · ` : ""}Now recruiting
              </p>

              <h1 className="display mt-3 text-5xl sm:text-6xl lg:text-7xl">
                We are hiring
                <br />
                <span className="text-brand">gym trainers</span>
              </h1>

              <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
                Certified trainer-a irundha, kizhe irukra form-a fill pannunga. 2 nimisham
                podhum — resume illaatiyum apply pannalaam. Shortlist aana udane call
                pannuvom.
              </p>

              <Link
                href="/apply"
                className="display mt-8 inline-flex w-full items-center justify-center gap-2 bg-brand px-8 py-4 text-xl text-brand-ink transition hover:brightness-110 sm:w-auto"
              >
                Apply as a trainer <span aria-hidden>→</span>
              </Link>
            </div>

            {/* Desktop-only visual slab */}
            <div className="hidden lg:block">
              <div className="relative aspect-[4/5] border border-line bg-surface">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_20%,#242424_0%,#101010_100%)]"
                />
                <div className="absolute inset-x-0 bottom-0 border-t border-line bg-background/80 p-6 backdrop-blur">
                  <p className="eyebrow text-xs text-brand">{gymName}</p>
                  <p className="display mt-1 text-3xl">Built for coaches</p>
                  <p className="mt-2 text-sm text-muted">
                    Full time · Part time · Freelance roles open.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- specialties ---------------- */}
        <section className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="eyebrow text-sm text-brand">Specialties needed</h2>
          <ul className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
            {SPECIALIZATIONS.map((s) => (
              <li
                key={s}
                className="shrink-0 border border-line bg-surface px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-muted"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- how it works ---------------- */}
        <section className="mx-auto max-w-6xl px-5 pb-4">
          <h2 className="display text-3xl">How it works</h2>

          <ol className="mt-5 grid gap-3 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 border border-line border-l-2 border-l-brand bg-surface p-5"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-surface-2 text-brand">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden
                  >
                    {step.icon}
                  </svg>
                </span>
                <div>
                  <h3 className="eyebrow text-sm">
                    <span className="text-brand">{i + 1}.</span> {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------- closing CTA ---------------- */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <div className="border border-line bg-surface p-8 text-center sm:p-12">
            <h2 className="display text-3xl sm:text-4xl">Ready to coach with us?</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">
              Applications-a 2-3 working days-ku ulla review panni, phone-la contact pannuvom.
            </p>
            <Link
              href="/apply"
              className="display mt-6 inline-flex bg-brand px-8 py-3.5 text-lg text-brand-ink transition hover:brightness-110"
            >
              Start application
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
