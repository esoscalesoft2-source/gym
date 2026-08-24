"use client";

import { useFormStatus } from "react-dom";

/**
 * Disables itself while the Server Action is in flight. Without this the plain
 * button gave no feedback at all, so an owner who clicked twice (or once on a
 * slow connection) could resubmit the form with the browser's stale <select>
 * value and silently undo their own status change.
 */
export function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="eyebrow mt-4 w-full bg-brand px-5 py-2.5 text-sm text-brand-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}
