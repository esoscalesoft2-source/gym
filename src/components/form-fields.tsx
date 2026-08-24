"use client";

import type { ReactNode } from "react";

export const inputClass =
  "w-full border border-line bg-surface px-3 py-3 text-foreground outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-1 focus:ring-brand/40";

export function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block text-xs text-muted">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs font-medium text-rose-400">{error}</span>}
    </label>
  );
}

/** Multi-select rendered as tappable chips — much easier than a <select multiple> on mobile. */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  error,
}: {
  options: readonly T[];
  value: T[];
  onChange: (next: T[]) => void;
  error?: string;
}) {
  const toggle = (opt: T) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              aria-pressed={active}
              className={
                // min-h-11 keeps the chip at the 44px minimum touch target on phones,
                // which most applicants use.
                "inline-flex min-h-11 items-center border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition " +
                (active
                  ? "border-brand bg-brand text-brand-ink"
                  : "border-line bg-surface text-muted hover:border-muted hover:text-foreground")
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error && <span className="mt-1.5 block text-xs font-medium text-rose-400">{error}</span>}
    </>
  );
}

export function RadioRow<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: readonly { value: T; label: string }[];
  value: string;
  onChange: (next: T) => void;
  name: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          name={name}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={
            "inline-flex min-h-11 items-center border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition " +
            (value === opt.value
              ? "border-brand bg-brand text-brand-ink"
              : "border-line bg-surface text-muted hover:border-muted hover:text-foreground")
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function FileInput({
  accept,
  multiple,
  onFiles,
  files,
  hint,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  files: File[];
  hint?: string;
}) {
  return (
    <div>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => onFiles(Array.from(e.target.files ?? []))}
        className="block w-full cursor-pointer border border-line bg-surface text-sm text-muted file:mr-3 file:cursor-pointer file:border-0 file:border-r file:border-line file:bg-surface-2 file:px-4 file:py-3 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-brand hover:file:bg-line"
      />
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f) => (
            <li key={f.name} className="text-xs text-brand">
              ✓ {f.name} <span className="text-muted">({Math.round(f.size / 1024)} KB)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Checkbox styled for the dark theme, used for consent / relocate toggles. */
export function CheckboxCard({
  children,
  ...props
}: React.ComponentProps<"input"> & { children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border border-line bg-surface p-4 transition hover:border-muted">
      <input
        {...props}
        type="checkbox"
        className="mt-0.5 h-5 w-5 shrink-0 accent-[#cfff00]"
      />
      <span className="text-sm text-muted">{children}</span>
    </label>
  );
}
