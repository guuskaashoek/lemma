/**
 * The Lemma logo.
 *
 * Three blocks climbing like stairs: small steps that lead to something
 * bigger. The last block is filled, like the ∎ that ends a proof: this step
 * is proven. Drawn in `currentColor`, so it works in dark and light mode.
 */
import type { SVGProps } from "react";

/** The mark on its own (also used for the favicon). */
export function LogoMark({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden {...props}>
      <rect x="3" y="20" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="2.2" />
      <rect x="11.5" y="11.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="2.2" />
      <rect x="20" y="3" width="9" height="9" rx="1.5" fill="currentColor" />
    </svg>
  );
}

/** Mark plus the word "Lemma". */
export function Logo({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      <span className="text-lg font-semibold tracking-tight">Lemma</span>
    </span>
  );
}
