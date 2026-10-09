const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export function IconoTipo({ tipo }: { tipo: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="mt-0.5 flex-none text-birome" {...P}>
      {tipo === "foco" && <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" />}
      {tipo === "libro" && (<><path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z" /><path d="M12 6v14" /></>)}
      {tipo === "hoja" && (<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>)}
      {tipo === "lista" && <path d="M3 6l2 2 3-3M3 15l2 2 3-3M12 7h9M12 16h9" />}
    </svg>
  );
}
export const Flecha = ({ className = "" }: { className?: string }) => (
  <svg width="46" height="24" viewBox="0 0 46 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M2 18C10 4 26 2 42 12M34 6l8 6-9 4" />
  </svg>
);
export const Tick = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="flex-none text-birome" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M4 13l5 5L20 6" />
  </svg>
);
export const Estrella = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" />
  </svg>
);
export const Taza = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="flex-none" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <path d="M4 9h12v5a5 5 0 01-5 5H9a5 5 0 01-5-5zM16 10h2a2 2 0 010 4h-2M8 3v3M12 3v3" />
  </svg>
);
export const Circulo = () => (
  <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden className="pointer-events-none absolute -left-3 -top-2 h-[calc(100%+16px)] w-[calc(100%+24px)] overflow-visible" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M60 3C30 1 3 8 3 20s25 18 50 17 44-7 44-18S70 0 45 4" />
  </svg>
);
