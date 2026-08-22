import Link from "next/link";
import ApplyForm from "./ApplyForm";

const gymName = process.env.NEXT_PUBLIC_GYM_NAME || "Our Gym";

export const metadata = { title: `Apply as Trainer — ${gymName}` };

export default function ApplyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back
      </Link>

      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Trainer application</h1>
      <p className="mt-1.5 text-sm text-slate-600">
        {gymName} · Star (<span className="text-brand">*</span>) irukra field mattum mandatory.
      </p>

      <div className="mt-8">
        <ApplyForm />
      </div>
    </main>
  );
}
