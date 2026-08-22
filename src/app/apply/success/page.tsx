import Link from "next/link";

export const metadata = { title: "Application received" };

export default function SuccessPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-5 text-center">
      <div className="flex h-20 w-20 items-center justify-center border-2 border-brand text-4xl text-brand">
        ✓
      </div>

      <h1 className="display mt-8 text-4xl sm:text-5xl">Application kedaichiduchu</h1>

      <p className="mt-4 text-muted">
        Nandri. Unga details-a naanga paathutu, 2-3 working days-ku ulla neenga koduthirukra
        number-ku call illa WhatsApp panniduvom.
      </p>

      <Link
        href="/"
        className="display mt-9 border border-line bg-surface px-8 py-3.5 text-lg text-foreground transition hover:border-brand hover:text-brand"
      >
        Home page-ku po
      </Link>
    </main>
  );
}
