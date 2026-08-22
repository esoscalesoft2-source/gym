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
      <h1 className="text-2xl font-bold">Gym owner login</h1>
      <p className="mt-1.5 mb-8 text-sm text-slate-600">
        Applications-a paakaradhukku login pannunga.
      </p>

      <LoginForm next={next ?? "/dashboard"} />

      <Link href="/" className="mt-8 text-center text-sm text-slate-500 hover:text-slate-800">
        ← Home
      </Link>
    </main>
  );
}
