import Link from "next/link";

export const metadata = { title: "Application received" };

export default function SuccessPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
        ✓
      </div>

      <h1 className="mt-6 text-2xl font-bold">Application kedaichiduchu!</h1>

      <p className="mt-3 text-slate-600">
        Nandri. Unga details-a naanga paathutu, 2-3 working days-ku ulla neenga koduthirukra
        number-ku call illa WhatsApp panniduvom.
      </p>

      <Link
        href="/"
        className="mt-8 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:opacity-90"
      >
        Home page-ku po
      </Link>
    </main>
  );
}
