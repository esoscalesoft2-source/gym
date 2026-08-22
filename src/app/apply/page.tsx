import ApplyForm from "./ApplyForm";
import { SiteHeader } from "@/components/site-header";
import { SetupNotice, firebaseConfigured } from "@/components/setup-notice";

const gymName = process.env.NEXT_PUBLIC_GYM_NAME || "Our Gym";

export const metadata = { title: `Apply as Trainer — ${gymName}` };

export default function ApplyPage() {
  // Without this the applicant fills in all four steps and only discovers the
  // backend is missing when they press submit.
  if (!firebaseConfigured || !process.env.NEXT_PUBLIC_GYM_ID) return <SetupNotice />;

  return (
    <>
      <SiteHeader cta={false} />

      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="display text-4xl sm:text-5xl">Trainer application</h1>
        <p className="mt-2 text-sm text-muted">
          {gymName} · Only the fields marked with a star (
          <span className="text-brand">*</span>) are required.
        </p>

        <div className="mt-9">
          <ApplyForm />
        </div>
      </main>
    </>
  );
}
