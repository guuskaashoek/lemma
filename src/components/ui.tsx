/**
 * Small shared UI building blocks in the Lemma style.
 */
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-invert-bg text-invert-fg hover:opacity-90 border border-transparent",
    secondary: "border border-border-strong text-fg hover:border-fg",
    ghost: "text-muted hover:text-fg",
    danger: "border border-bad text-bad hover:bg-bad-bg",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition-opacity disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Field({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <input
        className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-base focus:border-fg focus:outline-none"
        {...props}
      />
      {hint && <span className="mt-1 block text-sm text-muted">{hint}</span>}
    </label>
  );
}

export function Alert({ kind, children }: { kind: "error" | "ok"; children: ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3 py-2 ${kind === "error" ? "border-bad bg-bad-bg text-bad" : "border-good bg-good-bg text-good"}`}
    >
      {children}
    </p>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-surface p-5 ${className}`}>{children}</div>;
}

/** Small uppercase label above a section. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-1 text-xs font-semibold tracking-widest text-muted uppercase">{children}</p>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
    >
      <div className="h-full rounded-full bg-fg transition-[width] duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}
