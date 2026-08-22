"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "./actions";
import { inputClass } from "@/components/form-fields";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="display w-full bg-brand px-5 py-3.5 text-lg text-brand-ink transition hover:brightness-110 disabled:opacity-60"
    >
      {pending ? "Checking..." : "Login"}
    </button>
  );
}

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(login, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <label className="block">
        <span className="eyebrow mb-2 block text-xs text-muted">Email</span>
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </label>

      <label className="block">
        <span className="eyebrow mb-2 block text-xs text-muted">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </label>

      {state.error && (
        <p className="border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
