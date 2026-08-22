import Link from "next/link";

const gymName = process.env.NEXT_PUBLIC_GYM_NAME || "Our Gym";

/** Sticky top bar for the trainer-facing pages. */
export function SiteHeader({ cta = true }: { cta?: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-brand">◆</span>
          <span className="display text-lg tracking-wide">{gymName}</span>
        </Link>

        {cta && (
          <Link
            href="/apply"
            className="display bg-brand px-3.5 py-1.5 text-sm text-brand-ink transition hover:brightness-110"
          >
            Apply now
          </Link>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <p className="eyebrow text-xs text-brand">
          © {new Date().getFullYear()} {gymName} · Engineered for power
        </p>
        <nav className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-wider text-muted">
          <Link href="/login" className="transition hover:text-foreground">
            Gym owner login
          </Link>
          <Link href="/apply" className="transition hover:text-foreground">
            Apply as trainer
          </Link>
        </nav>
      </div>
    </footer>
  );
}
