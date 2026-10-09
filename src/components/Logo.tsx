/** Isotipo "m" de un solo trazo que termina en la bolita de la birome + logotipo "macheteo." (Young Serif). */
export function Isotipo({ size = 28, invert = false }: { size?: number; invert?: boolean }) {
  const ink = invert ? "#FFFFFF" : "var(--birome)";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden fill="none">
      <path d="M5 24V13c0-3 2-5 4.5-5S14 10 14 13v11M14 13c0-3 2-5 4.5-5S23 10 23 13v8" stroke={ink} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23" cy="25" r="2.6" fill={ink} />
    </svg>
  );
}

export function Logo({ invert = false, className = "" }: { invert?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Isotipo invert={invert} />
      <span className={`font-serif text-2xl leading-none ${invert ? "text-white" : "text-birome"}`}>macheteo.</span>
    </span>
  );
}
