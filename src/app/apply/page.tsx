import ApplyForm from "./ApplyForm";
import { SiteHeader } from "@/components/site-header";

const gymName = process.env.NEXT_PUBLIC_GYM_NAME || "Our Gym";

export const metadata = { title: `Apply as Trainer — ${gymName}` };

export default function ApplyPage() {
  return (
    <>
      <SiteHeader cta={false} />

      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="display text-4xl sm:text-5xl">Trainer application</h1>
        <p className="mt-2 text-sm text-muted">
          {gymName} · Star (<span className="text-brand">*</span>) irukra field mattum mandatory.
        </p>

        <div className="mt-9">
          <ApplyForm />
        </div>
      </main>
    </>
  );
}
