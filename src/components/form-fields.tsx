"use client";

import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20";

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
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
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
                "rounded-full px-3.5 py-2 text-sm font-medium transition " +
                (active
                  ? "bg-brand text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-slate-400")
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error && <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}
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
            "rounded-lg px-4 py-2.5 text-sm font-medium transition " +
            (value === opt.value
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-slate-400")
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
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f) => (
            <li key={f.name} className="text-xs text-slate-600">
              ✓ {f.name} ({Math.round(f.size / 1024)} KB)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
