import Link from "next/link";
import LoginForm from "./LoginForm";
import { SetupNotice, supabaseConfigured } from "@/components/setup-notice";

export const metadata = { title: "Gym owner login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  if (!supabaseConfigured) return <SetupNotice />;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-12">
      <p className="eyebrow text-sm text-brand">Staff area</p>
      <h1 className="display mt-2 text-4xl">Gym owner login</h1>
      <p className="mt-2 mb-8 text-sm text-muted">Applications-a paakaradhukku login pannunga.</p>

      <LoginForm next={next ?? "/dashboard"} />

      <Link
        href="/"
        className="mt-8 text-center text-xs uppercase tracking-wider text-muted transition hover:text-foreground"
      >
        ← Home
      </Link>
    </main>
  );
}
