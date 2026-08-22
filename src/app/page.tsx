import Link from "next/link";
import { SPECIALIZATIONS } from "@/lib/constants";

const gymName = process.env.NEXT_PUBLIC_GYM_NAME || "Our Gym";
const gymCity = process.env.NEXT_PUBLIC_GYM_CITY || "";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
        {gymCity ? `${gymCity} · ` : ""}We are hiring
      </p>

      <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">
        {gymName} is looking for gym trainers
      </h1>

      <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
        Certified trainer-a irundha, kizhe irukra form-a fill pannunga. 2 nimisham podhum —
        resume illaatiyum apply pannalaam. Shortlist aana udane naanga call pannuvom.
      </p>

      <Link
        href="/apply"
        className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-brand px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
      >
        Apply as a Trainer
      </Link>

      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Roles we hire for
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((s) => (
            <li
              key={s}
              className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200"
            >
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          { t: "Fill the form", d: "Basic details + experience. Phone number mattum mandatory." },
          { t: "We review", d: "Ellaa applications-um 2-3 working days-la paakuvom." },
          { t: "Interview", d: "Shortlist aanaa, gym-la neril interview." },
        ].map((step, i) => (
          <div key={step.t} className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
            <span className="text-xs font-bold text-brand">STEP {i + 1}</span>
            <h3 className="mt-1 font-semibold">{step.t}</h3>
            <p className="mt-1 text-sm text-slate-600">{step.d}</p>
          </div>
        ))}
      </section>

      <footer className="mt-16 border-t border-slate-200 pt-6 text-sm text-slate-500">
        <Link href="/login" className="hover:text-slate-800">
          Gym owner login
        </Link>
      </footer>
    </main>
  );
}
