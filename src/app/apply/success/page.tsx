import Link from "next/link";
import { formatRef } from "@/lib/constants";

export const metadata = { title: "Application received" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  // Reached by a direct visit rather than a submit — just skip the number.
  const refNo = ref && /^\d{1,9}$/.test(ref) ? Number(ref) : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-5 text-center">
      <div className="flex h-20 w-20 items-center justify-center border-2 border-brand text-4xl text-brand">
        ✓
      </div>

      <h1 className="display mt-8 text-4xl sm:text-5xl">Application received</h1>

      <p className="mt-4 text-muted">
        Thank you. We review every application within 2-3 working days and will call or
        WhatsApp you on the number you gave us.
      </p>

      {refNo !== null && (
        <div className="mt-8 w-full border border-line bg-surface p-5">
          <p className="eyebrow text-xs text-brand">Your application number</p>
          <p className="mt-1 font-mono text-3xl text-foreground">{formatRef(refNo)}</p>
          <p className="mt-2 text-xs text-muted">
            Keep this handy — quote it when you call or message us.
          </p>
        </div>
      )}

      <Link
        href="/"
        className="display mt-9 border border-line bg-surface px-8 py-3.5 text-lg text-foreground transition hover:border-brand hover:text-brand"
      >
        Back to home
      </Link>
    </main>
  );
}
